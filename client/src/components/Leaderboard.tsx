import { useEffect, useMemo, useState } from "react";

import { backendAPI } from "@/utils";

type LeaderboardEntry = {
  profileId: string;
  displayName: string;
  score: number;
};

const getProfileId = () => new URLSearchParams(window.location.search).get("profileId") || "";

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileId = useMemo(getProfileId, []);
  const myEntry = useMemo(() => {
    if (!profileId) return null;
    const index = leaderboard.findIndex((entry) => entry.profileId === profileId);
    if (index < 0) return null;
    return { entry: leaderboard[index], rank: index + 1 };
  }, [leaderboard, profileId]);

  useEffect(() => {
    backendAPI
      .get("/leaderboard")
      .then((res) => setLeaderboard((res.data?.leaderboard as LeaderboardEntry[]) || []))
      .catch(() => setError("Failed to load leaderboard."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="p2">Loading leaderboard...</p>;
  if (error) return <p className="p2">{error}</p>;

  return (
    <div className="grid gap-2">
      {profileId && (
        <div className="card warning-card">
          {myEntry ? (
            <div className="flex grid-cols-2 justify-between">
              <h5>My Best Score</h5>
              <h5>{myEntry.entry.score}</h5>
            </div>
          ) : (
            <p className="p2">No score yet — play a game to make the board.</p>
          )}
        </div>
      )}

      <h3 className="pt-3">🏆 Top 25</h3>
      {leaderboard.length === 0 ? (
        <p className="p2">No scores yet. Be the first!</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="h5">#</th>
              <th className="h5">Name</th>
              <th className="h5">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.profileId} className={entry.profileId === profileId ? "highlight" : ""}>
                <td className="p2">{index + 1}</td>
                <td className="p2">{entry.displayName}</td>
                <td className="p2">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
