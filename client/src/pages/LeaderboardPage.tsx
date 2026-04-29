import PageContainer from "../components/PageContainer";
import { GlobalStateContext } from "@context/GlobalContext";
import Leaderboard from "../components/Leaderboard"
import ResetLeaderboardButton from "../components/ResetLeaderboardButton"
import { useContext } from "react";
import "../styles/LeaderboardPage.css";
import {useAppNavigate} from '../hooks/useAppNavigate';

export const LeaderboardPage = ({ assetId }: { assetId: string }) => {
    const navigate=useAppNavigate();
    
    // go back to previous page
    const handleGoBack= () => {
        navigate(-1)
    }

  return (
    <PageContainer isLoading={false}>
      <div className="leaderboard-page-wrapper">
          <div className="page">
            {/* button to go back */}
            <button className="back-button" onClick={handleGoBack}> Go back </button>
            {/* display leaderboard */}
              <div className="leaderboard"> <Leaderboard assetId={assetId}/> </div>
          </div>
        </div>
    </PageContainer>
  )
}

export default LeaderboardPage
