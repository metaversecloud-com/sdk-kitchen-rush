import { useEffect, useState } from "react";
import { backendAPI } from "@/utils";
import PageContainer from "./PageContainer";
import ResetLeaderboardButton from './ResetLeaderboardButton';

type LeaderboardEntry = {
  profileId: string;
  displayName: string;
  score: number;
};

const Leaderboard = ({ assetId }: { assetId: string }) => {
  // store leaderboard entries from backend
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  // track loading state while data is being fetched
  const [isLoading, setIsLoading] = useState(true);
  // store error message if request fails
  const [error, setError] = useState<string | null>(null);
  // admin configuration
  const [isAdmin, setIsAdmin] = useState(false);



  useEffect(() => {
    backendAPI
    // get leaderboard data from backend when component loads
      .get("/leaderboard")
      .then((res) => {
          setLeaderboard(res.data.data.leaderboard)
          setIsAdmin(res.data.data.isAdmin);
      })
      .catch(() => setError("Failed to load leaderboard."))
      .finally(() => setIsLoading(false));
  }, []);

   // show loading message while waiting for backend response
  if (isLoading) return <p className="p2">Loading leaderboard...</p>;
   // show error message if leaderboard request fails
  if (error) return <p className="p2">{error}</p>;

   return (
    <div>
       {/* heading for leaderboard section */}
      <h2 className="h2">🏆 Top 25</h2>
      {leaderboard.length === 0 ? (
        // show message if there are no scores yet
        <p className="p2">No scores yet. Be the first!</p>
      ) : (
         // display leaderboard table if scores exist
        <table className="table">
          <thead>
            <tr>
              <th className="h5">#</th>
              <th className="h5">Name</th>
              <th className="h5">Score</th>
            </tr>
          </thead>
          <tbody>
              {/* map through leaderboard entries and display each one */}
            {leaderboard.map((entry, index) => (
              <tr key={entry.profileId}>
                <td className="p2">{index + 1}</td>
                <td className="p2">{entry.displayName}</td>
                <td className="p2">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="leaderboard-button"> {isAdmin && <ResetLeaderboardButton assetId={assetId} />}</div>
    </div>
  );
};

export default Leaderboard;