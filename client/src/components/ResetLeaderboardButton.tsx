import { backendAPI } from "@/utils/backendAPI";
import { useContext } from "react";
import { GlobalDispatchContext } from "@/context/GlobalContext";
import { setErrorMessage } from "@/utils/setErrorMessage";
import { ResetLeaderboard } from "../types/ResetLeaderboard"

export const ResetLeaderboardButton = ({ assetId }: ResetLeaderboard) => {
  const dispatch = useContext(GlobalDispatchContext);

  const handleReset = async () => {
    const confirmed = window.confirm("Are you sure you want to reset the leaderboard?");
    if (!confirmed) return;
    
    try {
      const res = await backendAPI.post("/leaderboard/reset", { assetId });

      if (res.data.message === "Leaderboard already empty") {
        alert("Leaderboard is already empty.");
        return;
      }

      alert("Leaderboard reset!");
    } catch (err) {
      setErrorMessage(dispatch, err as any);
    }

  };

  return (
    <button className="button" onClick={handleReset}>
      Reset Leaderboard
    </button>
  );
};

export default ResetLeaderboardButton;