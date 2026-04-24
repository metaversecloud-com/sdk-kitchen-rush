import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import { PageContainer } from "@/components";

//utils
import { backendAPI, setGameState } from "../utils";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// styles
import "../styles//Home.css";
import Leaderboard from "@/components/Leaderboard";

export const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { droppedAsset, hasInteractiveParams} = useContext(GlobalStateContext);
  const navigate = useNavigate();
  // console.log("PageContainer isAdmin:", isAdmin);

  const imgSrc = droppedAsset?.topLayerURL || droppedAsset?.bottomLayerURL;

  const [isLoading, setIsLoading] = useState(true);

  const handleStart = () => {
    navigate("/level-start/1");
  };

  const handleLeaderboardPage = () => navigate('/leaderboard');

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/game-state")
        .then((response) => {
          setGameState(dispatch, response.data);
        })
        .catch((error) => console.error("Failed to load game state:", error))
        .finally(() => setIsLoading(false)); // only stop loading after fetch
    } else {
      setIsLoading(false); // no params, just unblock
    }
}, [hasInteractiveParams]);

  return (
    <PageContainer isLoading={isLoading} headerText="Kitchen Rush">
      <div className="home-screen">
        <div className="home-card">
          <div className="home-top">
            <div className="home-badge">☕ Coffee Game</div>          
            <h1 className="home-title">Kitchen Rush</h1>
            <p className="home-subtitle">
              Make drinks fast, keep customers happy, and build your streak.
            </p>
          </div>

          {/* game image */}
          <div className="home-image-wrap">
            {imgSrc ? (
              <img
                className="home-image"
                alt="Kitchen Rush"
                src={imgSrc}
              />
            ) : (
              <div className="home-image home-image-placeholder">
                <span>☕</span>
              </div>
            )}
          </div>

            {/* instructions */}
          <div className="home-content">
            <div className="info-card">
              <h2>How to Play</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-icon">👀</span>
                  <span>Check the customer’s order</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🥤</span>
                  <span>Pick the right size, temperature, and milk</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">✅</span>
                  <span>Press <strong>Serve</strong> when the tray is ready</span>
                </div>
              </div>
            </div>

            <div className="info-card warning-card">
              <h2>Watch Out</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-icon">⏱️</span>
                  <span>Run out of time and customers get upset</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">❌</span>
                  <span>Wrong orders also cost you</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">😠</span>
                  <span>5 angry customers = game over</span>
                </div>
              </div>
            </div>

            <div className="streak-box">
              🔥 Build streaks for bonus points
            </div>
          </div>

            {/* start button */}
          <div className="home-actions">
            <button onClick={handleStart} className="start-button">
              Start Game
            </button>
            <button className="leaderboard-button" onClick={handleLeaderboardPage}>
                See Leaderboard
            </button>
            <p className="home-footer-text">Ready to serve? Let’s go.</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Home;