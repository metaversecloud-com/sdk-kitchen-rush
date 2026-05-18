import { useContext, useState } from "react";

import { backendAPI, setErrorMessage } from "@/utils";
import { GlobalDispatchContext } from "@/context/GlobalContext";
import { ErrorType } from "@/context/types";

export const ResetLeaderboardButton = ({ onReset }: { onReset?: () => void }) => {
  const dispatch = useContext(GlobalDispatchContext);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the leaderboard?")) return;
    setIsResetting(true);
    try {
      const res = await backendAPI.post("/leaderboard/reset");
      if (res.data?.alreadyEmpty) {
        window.alert("Leaderboard is already empty.");
      } else {
        window.alert("Leaderboard reset!");
        onReset?.();
      }
    } catch (err) {
      setErrorMessage(dispatch, err as ErrorType);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button className="btn btn-danger" onClick={handleReset} disabled={isResetting}>
      Reset Leaderboard
    </button>
  );
};

export default ResetLeaderboardButton;
