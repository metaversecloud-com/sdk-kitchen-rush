import { Credentials, IDroppedAsset } from "../types/index.js";

export type LeaderboardEntry = {
  profileId: string;
  displayName: string;
  score: number;
};

const MAX_LEADERBOARD_ENTRIES = 25;

export const parseLeaderboard = (leaderboardData: Record<string, string> = {}): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  for (const profileId in leaderboardData) {
    const [displayName, scoreStr] = (leaderboardData[profileId] || "").split("|");
    entries.push({
      profileId,
      displayName: displayName || "Anonymous",
      score: parseInt(scoreStr, 10) || 0,
    });
  }
  return entries.sort((a, b) => b.score - a.score).slice(0, MAX_LEADERBOARD_ENTRIES);
};

export const updateLeaderboard = async ({
  credentials,
  droppedAsset,
  score,
}: {
  credentials: Credentials;
  droppedAsset: IDroppedAsset;
  score: number;
}): Promise<void> => {
  const { displayName, profileId } = credentials;

  const existingEntry = (droppedAsset.dataObject?.leaderboard ?? {})[profileId];
  if (existingEntry) {
    const existingScore = parseInt(existingEntry.split("|")[1], 10) || 0;
    if (existingScore >= score) return;
  }

  await droppedAsset.updateDataObject(
    { [`leaderboard.${profileId}`]: `${displayName}|${score}` },
    { lock: { lockId: `leaderboard-${profileId}-${Date.now()}`, releaseLock: true } },
  );
};
