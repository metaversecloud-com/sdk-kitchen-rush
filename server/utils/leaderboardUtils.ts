import { Credentials } from "../types/Credentials";

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

  return entries.sort((a, b) => b.score - a.score).slice(0, 25);
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

   await droppedAsset.updateDataObject(
    { leaderboard: { [profileId]: `${displayName}|${score}` } },
    { lock: { lockId: `leaderboard-${profileId}`, releaseLock: true } }
  );
  } catch (error) {
    return error as Error;
  }
};