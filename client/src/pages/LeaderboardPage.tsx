import PageContainer from "../components/PageContainer";
import { GlobalStateContext } from "@context/GlobalContext";
import Leaderboard from "../components/Leaderboard"
import ResetLeaderboardButton from "../components/ResetLeaderboardButton"
import {useNavigate} from "react-router-dom"
import { useContext } from "react";
import "../styles/LeaderboardPage.css";

export const LeaderboardPage = ({ assetId }: { assetId: string }) => {
    const navigate=useNavigate();
    const { isAdmin } = useContext(GlobalStateContext);
    
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
              <div className="leaderboard"> <Leaderboard /> </div>
              {/* reset leaderboard button connected to the asset */}
              {isAdmin && (<button className="reset-button"> <ResetLeaderboardButton assetId={assetId}/> </button>)}
          </div>
        </div>
    </PageContainer>
  )
}

export default LeaderboardPage
