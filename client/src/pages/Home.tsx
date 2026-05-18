import { useContext, useEffect, useState } from "react";

import coffeeShopImg from "@/assets/coffeeShop.png";
import { BadgesTab, Game, GameOver, LevelIntermission, PageContainer, ScoresTab } from "@/components";
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { ErrorType, SET_GAME_STATE } from "@/context/types";
import { ActiveBadge, GameOverPayload, LevelStart } from "@/hooks/useOrderManager";
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

type Phase = "tabs" | "intermission" | "game" | "gameover";
type PlayerTab = "game" | "scores" | "badges";

const INITIAL_LEVEL_STATE: LevelStart = { score: 0, angry: 0, streak: 0, ordersServed: 0, incorrectOrders: 0 };
const EMPTY_FINAL: GameOverPayload = { score: 0, ordersServed: 0, correctOrders: 0, incorrectOrders: 0, angryCount: 0 };
const FINAL_LEVEL = 4;

export const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, visitorInventory } = useContext(GlobalStateContext);
  const [isLoading, setIsLoading] = useState(true);

  const [phase, setPhase] = useState<Phase>("tabs");
  const [activeTab, setActiveTab] = useState<PlayerTab>("game");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelStart, setLevelStart] = useState<LevelStart>(INITIAL_LEVEL_STATE);
  const [finalStats, setFinalStats] = useState<GameOverPayload>(EMPTY_FINAL);

  useEffect(() => {
    if (!hasInteractiveParams) {
      setIsLoading(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const forceRefreshInventory = params.get("forceRefreshInventory") === "true";
    backendAPI
      .get("/game-state", { params: { forceRefreshInventory } })
      .then((res) => setGameState(dispatch, res.data))
      .catch((err) => setErrorMessage(dispatch, err as ErrorType))
      .finally(() => setIsLoading(false));
  }, [hasInteractiveParams, dispatch]);

  const startGame = () => {
    setCurrentLevel(1);
    setLevelStart(INITIAL_LEVEL_STATE);
    setPhase("intermission");
  };

  const beginLevel = () => setPhase("game");

  const handleLevelComplete = (next: LevelStart) => {
    if (currentLevel >= FINAL_LEVEL) {
      // Final level falls through to game-end inside the hook; nothing to do here.
      return;
    }
    setLevelStart(next);
    setCurrentLevel((prev) => prev + 1);
    setPhase("intermission");
  };

  // Transition to GameOver instantly with raw stats. GameOver itself owns the
  // /game-end call so the player sees feedback immediately instead of a frozen
  // game screen while the server tallies results.
  const handleGameOver = (payload: GameOverPayload) => {
    setFinalStats(payload);
    setPhase("gameover");
  };

  // Merge each in-game badge grant into context so the next level's Game mount
  // (which rebuilds its ownedBadgesRef from context) doesn't re-ask the server
  // for badges already earned this session.
  const handleBadgeGranted = (badge: ActiveBadge) => {
    if (!dispatch) return;
    const mergedBadges = { ...(visitorInventory?.badges || {}) };
    if (mergedBadges[badge.name]) return;
    mergedBadges[badge.name] = { id: badge.name, name: badge.name, icon: badge.icon };
    dispatch({ type: SET_GAME_STATE, payload: { visitorInventory: { badges: mergedBadges } } });
  };

  const playAgain = () => {
    setCurrentLevel(1);
    setLevelStart(INITIAL_LEVEL_STATE);
    setFinalStats(EMPTY_FINAL);
    setActiveTab("game");
    setPhase("tabs");
  };

  if (phase === "intermission") {
    return (
      <LevelIntermission
        level={currentLevel}
        carry={{ score: levelStart.score, angry: levelStart.angry }}
        onContinue={beginLevel}
      />
    );
  }

  if (phase === "game") {
    return (
      <Game
        level={currentLevel}
        initial={levelStart}
        onLevelComplete={handleLevelComplete}
        onGameOver={handleGameOver}
        onBadgeGranted={handleBadgeGranted}
      />
    );
  }

  if (phase === "gameover") {
    return <GameOver stats={finalStats} onPlayAgain={playAgain} />;
  }

  return (
    <PageContainer isLoading={isLoading} headerText="Kitchen Rush">
      <div className="tab-container mb-3">
        <button className={activeTab === "game" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("game")}>
          Game
        </button>
        <button className={activeTab === "scores" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("scores")}>
          Scores
        </button>
        <button className={activeTab === "badges" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("badges")}>
          Badges
        </button>
      </div>

      {activeTab === "game" && (
        <div className="grid gap-3">
          <img className="home-image" alt="Kitchen Rush" src={coffeeShopImg} />

          <p className="p2">Make drinks fast, keep customers happy, and build your streak.</p>

          <div className="card info-card">
            <h4>How to Play</h4>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">👀</span>
                <span>Check the customer's order</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🥤</span>
                <span>Pick the right size, temperature, and milk</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✅</span>
                <span>
                  Press <strong>Serve</strong> when the tray is ready
                </span>
              </div>
            </div>
          </div>

          <div className="card warning-card">
            <h4>Watch Out</h4>
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

          <div className="chip-primary">🔥 Build streaks for bonus points</div>

          <button onClick={startGame} className="btn btn-primary">
            Start Game
          </button>
        </div>
      )}

      {activeTab === "scores" && <ScoresTab />}
      {activeTab === "badges" && <BadgesTab />}
    </PageContainer>
  );
};

export default Home;
