import PageContainer from "../components/PageContainer";
import Leaderboard from "../components/Leaderboard"
import ResetLeaderboardButton from "../components/ResetLeaderboardButton"
import {useNavigate} from "react-router-dom"
import "../styles/LeaderboardPage.css";

export const LeaderboardPage = ({ assetId }: { assetId: string }) => {
    const navigate=useNavigate();
    
    const handleGoBack= () => {
        navigate(-1)
    }

  return (
    <PageContainer isLoading={false}>
        <button className="back-button" onClick={handleGoBack}> Go back </button>
        <div className="page">
            <div className="leaderboard"> <Leaderboard /> </div>
            <button className="reset-button"> <ResetLeaderboardButton assetId={assetId}/> </button>
        </div>
    </PageContainer>
  )
}

export default LeaderboardPage
