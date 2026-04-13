import { Credentials } from "../types/Credentials";

const MAX_LEADERBOARD_ENTRIES = 25;

export type LeaderboardEntry = {
  profileId: string;
  displayName: string;
  score: number;
};

export const parseLeaderboard = (
  leaderboardData: Record<string, string>
): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];

  for (const profileId in leaderboardData) {
    const data = leaderboardData[profileId];
    const [displayName, scoreStr] = data.split("|");
    entries.push({
      profileId,
      displayName,
      score: parseInt(scoreStr) || 0,
    });
  }

  return entries.sort((a, b) => b.score - a.score);
};

export const updateLeaderboard = async ({
  credentials,
  droppedAsset,
  score,
}: {
  credentials: Credentials;
  droppedAsset: any;
  score: number;
}): Promise<void | Error> => {
   console.log("updateLeaderboard called with score:", score, "profileId:", credentials.profileId);
  try {
    const { displayName, profileId, urlSlug } = credentials;

    const leaderboardData = (
      droppedAsset.dataObject as { leaderboard?: Record<string, string> }
    )?.leaderboard ?? {};

    // Only update if new score is better than existing
    if (leaderboardData[profileId]) {
      const [, existingScoreStr] = leaderboardData[profileId].split("|");
      const existingScore = parseInt(existingScoreStr) || 0;
      if (existingScore >= score) return;
    }

    // Update entry
    leaderboardData[profileId] = `${displayName}|${score}`;

    // Enforce top 25
    const sorted = parseLeaderboard(leaderboardData);
    const trimmed = sorted.slice(0, MAX_LEADERBOARD_ENTRIES);
    const trimmedData: Record<string, string> = {};
    for (const entry of trimmed) {
      trimmedData[entry.profileId] = `${entry.displayName}|${entry.score}`;
    }

    if ((droppedAsset.dataObject as { leaderboard?: Record<string, string> })?.leaderboard) {
      await droppedAsset.updateDataObject(
        { leaderboard: trimmedData },
        {
          lock: {
            lockId: `leaderboard-${profileId}`,
            releaseLock: true,
          },
          analytics: [{ analyticName: "leaderboard_update", profileId, uniqueKey: profileId, urlSlug }],
        }
      );
    } else {
      await droppedAsset.updateDataObject(
        { leaderboard: trimmedData },
        {
          lock: {
            lockId: `leaderboard-${profileId}`,
            releaseLock: true,
          }
        }
      );
    }
  } catch (error) {
    return error as Error;
  }
};