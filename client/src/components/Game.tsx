import { useContext, useEffect, useMemo } from "react";

import { FeedbackToast, Ingredients, Order, PageContainer } from "@/components";

import { levelConfig } from "@/config/levelConfig";
import { GlobalStateContext } from "@/context/GlobalContext";
import useOrderManager, { ActiveBadge, GameOverPayload, LevelStart } from "@/hooks/useOrderManager";

import "@/styles/Game.css";

interface GameProps {
  level: number;
  initial: LevelStart;
  onLevelComplete: (next: LevelStart) => void;
  onGameOver: (final: GameOverPayload) => void;
  onBadgeGranted: (badge: ActiveBadge) => void;
}

export const Game = ({ level, initial, onLevelComplete, onGameOver, onBadgeGranted }: GameProps) => {
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
  } = useOrderManager({ level, initial, ownedBadgeNames, onLevelComplete, onGameOver, onBadgeGranted });

  // Kick off the first order on mount; the hook owns the rest of the loop.
  useEffect(() => {
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalTime = activeOrder ? activeOrder.timeLimit / 1000 : 0;
  const timePercent = totalTime > 0 ? Math.max(0, (timeRemaining / totalTime) * 100) : 0;
  const timerDanger = timePercent < 30;

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
          <div className="hud-item">⏱️ {Math.ceil(timeRemaining)}s</div>
          <div className="hud-item">😡 {angryCount}/5</div>
        </div>
        <div className="order-timer" aria-label={`${Math.ceil(timeRemaining)} seconds remaining`}>
          <div
            className="order-timer__bar"
            style={{ width: `${timePercent}%`, background: timerDanger ? "#ef4444" : "#22c55e" }}
          />
        </div>
        {activeOrder && <Order order={activeOrder} tray={tray} currentLevel={level} />}
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
