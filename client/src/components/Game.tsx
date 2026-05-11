import { useEffect } from "react";

import { BadgeToast } from "./BadgeToast";
import { FeedbackToast } from "./FeedbackToast";
import { Ingredients } from "./Ingredients";
import { Order } from "./Order";
import { PageContainer } from "./PageContainer";
import { Tray } from "./Tray";

import { levelConfig } from "@/config/levelConfig";
import useOrderManager, { LevelStart } from "@/hooks/useOrderManager";

import "@/styles/Game.css";

interface GameProps {
  level: number;
  initial: LevelStart;
  onLevelComplete: (next: LevelStart) => void;
  onGameOver: (final: { score: number; ordersServed: number }) => void;
}

export const Game = ({ level, initial, onLevelComplete, onGameOver }: GameProps) => {
  const config = levelConfig[level as keyof typeof levelConfig];

  const {
    activeBadge,
    activeOrder,
    angryCount,
    feedback,
    score,
    streak,
    timeRemaining,
    tray,
    advance,
    dismissBadge,
    handleManualCloseShop,
    handleServeOrder,
    updateTray,
  } = useOrderManager({ level, initial, onLevelComplete, onGameOver });

  // Kick off the first order on mount.
  useEffect(() => {
    advance();
    // advance reads state via closure; we only want this on mount.
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

        {activeBadge && <BadgeToast badgeName={activeBadge.name} iconPath={activeBadge.icon} onClose={dismissBadge} />}
      </div>
    </PageContainer>
  );
};

export default Game;
