import { useContext } from "react";

import { Leaderboard } from "./Leaderboard";
import { ResetLeaderboardButton } from "./ResetLeaderboardButton";
import { GlobalStateContext } from "@/context/GlobalContext";

export const ScoresTab = () => {
  const { isAdmin } = useContext(GlobalStateContext);

  return (
    <div className="grid gap-3 mt-3">
      <Leaderboard />
      {isAdmin && <ResetLeaderboardButton />}
    </div>
  );
};

export default ScoresTab;
