import { backendAPI } from "@/utils/backendAPI";
import { useContext } from "react";
import { GlobalDispatchContext } from "@/context/GlobalContext";
import { setErrorMessage } from "@/utils/setErrorMessage";
import { ResetLeaderboard } from "../types/ResetLeaderboard"

export const ResetLeaderboardButton = ({ assetId }: ResetLeaderboard) => {
  const dispatch = useContext(GlobalDispatchContext);

  // function to reset leaderboard
  const handleReset = async () => {
    // display window from browser instead of in-game
    const confirmed = window.confirm("Are you sure you want to reset the leaderboard?");
    if (!confirmed) return; // if not confirmed stop
    
    try {
      // get response from backend of leaderboard api
      const res = await backendAPI.post("/leaderboard/reset", { assetId });

      // if leaderboard empty, display "empty leaderboard"
      if (res.data.message === "Leaderboard already empty") {
        alert("Leaderboard is already empty.");
        return;
      }
      
      // if leaderboard empty notify user
      alert("Leaderboard reset!");
    } catch (err) {
      setErrorMessage(dispatch, err as any);
    }

  };

  return (
    // display button
    <button className="button" onClick={handleReset}>
      Reset Leaderboard
    </button>
  );
};

export default ResetLeaderboardButton;