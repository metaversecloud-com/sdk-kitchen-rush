import { Request, Response } from "express";
import {
  AwardBadgeResult,
  Visitor,
  errorHandler,
  findRank,
  getCachedInventoryItems,
  getCredentials,
  getDroppedAsset,
  getVisitor,
  grantBadges,
  parseLeaderboard,
  updateLeaderboard,
} from "@utils/index.js";

const SHARP_CHEF_ACCURACY_THRESHOLD = 0.8;
const NO_SUBSTITUTIONS_CORRECT_THRESHOLD = 10;

const END_OF_GAME_BADGES = {
  OPEN_FOR_BUSINESS: "Open for Business",
  BACK_IN_KITCHEN: "Back in the Kitchen",
  SHARP_CHEF: "Sharp Chef",
  NO_SUBSTITUTIONS: "No Substitutions",
  CLEAN_SERVICE: "Clean Service",
  LINE_COOK: "Line Cook",
  SOUS_CHEF: "Sous Chef",
  HEAD_CHEF: "Head Chef",
  MASTER_CHEF: "Master Chef",
  ON_THE_BOARD: "On the Board",
  TOP_10: "Top 10",
  NUMBER_1: "Number 1",
} as const;

const LIFETIME_BADGE_THRESHOLDS: Array<{ badge: string; threshold: number }> = [
  { badge: END_OF_GAME_BADGES.LINE_COOK, threshold: 25 },
  { badge: END_OF_GAME_BADGES.SOUS_CHEF, threshold: 100 },
  { badge: END_OF_GAME_BADGES.HEAD_CHEF, threshold: 250 },
  { badge: END_OF_GAME_BADGES.MASTER_CHEF, threshold: 300 },
];

interface GameEndBody {
  correctOrders?: number;
  incorrectOrders?: number;
  angryCount?: number;
  finalScore?: number;
}

const sanitizeStats = (body: GameEndBody) => ({
  correctOrders: Math.max(0, Math.floor(Number(body.correctOrders) || 0)),
  incorrectOrders: Math.max(0, Math.floor(Number(body.incorrectOrders) || 0)),
  angryCount: Math.max(0, Math.floor(Number(body.angryCount) || 0)),
  finalScore: Math.max(0, Math.floor(Number(body.finalScore) || 0)),
});

export const handleGameEnd = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug } = credentials;
    const { correctOrders, incorrectOrders, angryCount, finalScore } = sanitizeStats(req.body || {});

    const { visitor, visitorStats } = await getVisitor(credentials, true);

    // Snapshot persistent stats before incrementing so we can detect threshold
    // crossings (e.g. "Open for Business" = first ever game played).
    const prevGamesPlayed = typeof visitorStats?.gamesPlayed === "number" ? visitorStats.gamesPlayed : 0;
    const prevLifetimeCorrect =
      typeof visitorStats?.lifetimeCorrectOrders === "number" ? visitorStats.lifetimeCorrectOrders : 0;
    const newGamesPlayed = prevGamesPlayed + 1;
    const newLifetimeCorrect = prevLifetimeCorrect + correctOrders;

    // Persist updated counters atomically. incrementDataObjectValue creates the
    // field if it's missing, so no separate initialization step is needed.
    await Promise.all([
      visitor.incrementDataObjectValue("gamesPlayed", 1, {
        analytics: [
          {
            analyticName: "gamesPlayed",
            profileId: credentials.profileId,
            uniqueKey: credentials.profileId,
            urlSlug,
          },
        ],
      } as any),
      correctOrders > 0
        ? visitor.incrementDataObjectValue("lifetimeCorrectOrders", correctOrders, {
            analytics: [
              {
                analyticName: "correctOrders",
                profileId: credentials.profileId,
                uniqueKey: credentials.profileId,
                urlSlug,
                incrementBy: correctOrders,
              },
            ],
          } as any)
        : Promise.resolve(),
    ]);

    // Leaderboard: update if it's a new personal best, then compute rank.
    const droppedAsset = await getDroppedAsset(credentials);
    if (finalScore > 0) {
      await updateLeaderboard({ credentials, droppedAsset, score: finalScore });
      await droppedAsset.fetchDataObject();
    }
    const leaderboard = parseLeaderboard((droppedAsset.dataObject?.leaderboard ?? {}) as Record<string, string>);
    const rank = findRank(leaderboard, credentials.profileId);

    // Collect every badge this game qualifies for. grantBadges dedupes against
    // the visitor's existing inventory; the client only shows newly-granted ones.
    const eligibleBadges: string[] = [];
    const accuracy = correctOrders + incorrectOrders > 0 ? correctOrders / (correctOrders + incorrectOrders) : 0;

    if (newGamesPlayed === 1) eligibleBadges.push(END_OF_GAME_BADGES.OPEN_FOR_BUSINESS);
    if (newGamesPlayed >= 3) eligibleBadges.push(END_OF_GAME_BADGES.BACK_IN_KITCHEN);
    if (correctOrders + incorrectOrders > 0 && accuracy >= SHARP_CHEF_ACCURACY_THRESHOLD) {
      eligibleBadges.push(END_OF_GAME_BADGES.SHARP_CHEF);
    }
    if (correctOrders >= NO_SUBSTITUTIONS_CORRECT_THRESHOLD && incorrectOrders === 0) {
      eligibleBadges.push(END_OF_GAME_BADGES.NO_SUBSTITUTIONS);
    }
    if (angryCount === 0 && correctOrders > 0) eligibleBadges.push(END_OF_GAME_BADGES.CLEAN_SERVICE);
    for (const { badge, threshold } of LIFETIME_BADGE_THRESHOLDS) {
      if (newLifetimeCorrect >= threshold) eligibleBadges.push(badge);
    }
    if (rank !== null) {
      eligibleBadges.push(END_OF_GAME_BADGES.ON_THE_BOARD);
      if (rank <= 10) eligibleBadges.push(END_OF_GAME_BADGES.TOP_10);
      if (rank === 1) eligibleBadges.push(END_OF_GAME_BADGES.NUMBER_1);
    }

    let grantedBadges: AwardBadgeResult[] = [];
    if (eligibleBadges.length > 0) {
      await visitor.fetchInventoryItems();
      const inventoryItems = await getCachedInventoryItems({ credentials });
      grantedBadges = await grantBadges({ visitor, inventoryItems, badgeNames: eligibleBadges });
    }

    return res.json({
      success: true,
      rank,
      visitorStats: { gamesPlayed: newGamesPlayed, lifetimeCorrectOrders: newLifetimeCorrect },
      grantedBadges: grantedBadges.filter((b) => b.granted).map(({ badgeName, icon }) => ({ name: badgeName, icon })),
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGameEnd",
      message: "Error finalizing game",
      req,
      res,
    });
  }
};
