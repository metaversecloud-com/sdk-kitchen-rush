import { useContext } from "react";

import { Leaderboard, PageContainer, ResetLeaderboardButton } from "@/components";
import { GlobalStateContext } from "@/context/GlobalContext";

interface LeaderboardPageProps {
  onBack: () => void;
}

export const LeaderboardPage = ({ onBack }: LeaderboardPageProps) => {
  const { isAdmin } = useContext(GlobalStateContext);

  return (
    <PageContainer isLoading={false}>
      <div className="leaderboard-page-wrapper">
        <div className="page">
          <button className="back-button" onClick={onBack}>
            Go Back
          </button>
          <Leaderboard />
          {isAdmin && <ResetLeaderboardButton />}
        </div>
      </div>
    </PageContainer>
  );
};

export default LeaderboardPage;
