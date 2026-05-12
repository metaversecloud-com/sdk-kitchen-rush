import { useContext, useEffect, useMemo } from "react";

import { FeedbackToast, Ingredients, Order, PageContainer, Tray } from "@/components";

import { levelConfig } from "@/config/levelConfig";
import { GlobalStateContext } from "@/context/GlobalContext";
import useOrderManager, { GameOverPayload, LevelStart } from "@/hooks/useOrderManager";

import "@/styles/Game.css";

interface GameProps {
  level: number;
  initial: LevelStart;
  onLevelComplete: (next: LevelStart) => void;
  onGameOver: (final: GameOverPayload) => void;
}

export const Game = ({ level, initial, onLevelComplete, onGameOver }: GameProps) => {
  const { visitorInventory } = useContext(GlobalStateContext);
  const ownedBadgeNames = useMemo(() => Object.keys(visitorInventory?.badges || {}), [visitorInventory]);
  const config = levelConfig[level as keyof typeof levelConfig];

  const {
    activeOrder,
    angryCount,
    feedback,
    score,
    streak,
    timeRemaining,
    tray,
    advance,
    handleManualCloseShop,
    handleServeOrder,
    updateTray,
  } = useOrderManager({ level, initial, ownedBadgeNames, onLevelComplete, onGameOver });

  // Kick off the first order on mount; the hook owns the rest of the loop.
  useEffect(() => {
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer isLoading={false}>
      <div className="grid gap-3">
        <div className="hud">
          <div className="hud-item">
            <span className="hud-label">Level</span> {config.title}
          </div>
          <div className="hud-item">
            <span className="hud-label">Score</span> {score}
          </div>
          <div className="hud-item">
            <span className="hud-label">Streak</span> {streak}
          </div>
          <div className="hud-item">⏱️ {timeRemaining}s</div>
          <div className="hud-item">😡 {angryCount}/5</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {activeOrder && <Order order={activeOrder} timeRemaining={timeRemaining} currentLevel={level} />}
          <Tray tray={tray} />
        </div>
        <Ingredients tray={tray} onSelect={updateTray} level={level} />
        <button className="btn btn-primary" onClick={handleServeOrder}>
          Serve Order
        </button>
        <button className="btn btn-text mt-2" onClick={handleManualCloseShop}>
          Close Shop
        </button>
        {feedback && <FeedbackToast feedback={feedback} />}
      </div>
    </PageContainer>
  );
};

export default Game;
