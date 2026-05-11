import { useContext, useEffect, useState } from "react";

import coffeeShopImg from "@/assets/coffeeShop.png";
import { BadgesTab, Game, GameOver, LevelIntermission, PageContainer, ScoresTab } from "@/components";
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { ErrorType } from "@/context/types";
import { LevelStart } from "@/hooks/useOrderManager";
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

type Phase = "tabs" | "intermission" | "game" | "gameover";
type PlayerTab = "game" | "scores" | "badges";

const INITIAL_LEVEL_STATE: LevelStart = { score: 0, angry: 0, streak: 0, ordersServed: 0 };
const FINAL_LEVEL = 4;

export const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams } = useContext(GlobalStateContext);
  const [isLoading, setIsLoading] = useState(true);

  const [phase, setPhase] = useState<Phase>("tabs");
  const [activeTab, setActiveTab] = useState<PlayerTab>("game");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelStart, setLevelStart] = useState<LevelStart>(INITIAL_LEVEL_STATE);
  const [finalStats, setFinalStats] = useState<{ score: number; ordersServed: number }>({
    score: 0,
    ordersServed: 0,
  });

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
      setFinalStats({ score: next.score, ordersServed: next.ordersServed });
      setPhase("gameover");
      return;
    }
    setLevelStart(next);
    setCurrentLevel((prev) => prev + 1);
    setPhase("intermission");
  };

  const handleGameOver = (final: { score: number; ordersServed: number }) => {
    setFinalStats(final);
    setPhase("gameover");
  };

  const playAgain = () => {
    setCurrentLevel(1);
    setLevelStart(INITIAL_LEVEL_STATE);
    setFinalStats({ score: 0, ordersServed: 0 });
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
      />
    );
  }

  if (phase === "gameover") {
    return <GameOver score={finalStats.score} ordersServed={finalStats.ordersServed} onPlayAgain={playAgain} />;
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
