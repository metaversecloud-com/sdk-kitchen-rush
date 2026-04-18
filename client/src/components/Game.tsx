import React, { useEffect, useState, useContext} from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams
import { GlobalStateContext } from "../context/GlobalContext";

// Components
import PageContainer from "./PageContainer";
import Order from "./Order";
import Ingredients from "./Ingredients";
import Tray from "./Tray";
import FeedbackToast from "./FeedbackToast"
import BadgeToast from './BadgeToast';

// Hooks & Config
import useOrderManager from "../hooks/useOrderManager";
import { levelConfig } from "../config/levelConfig";

import "../styles/Game.css";

// types
import { Feedback } from '../types/Feedback'


const Game = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const currentLevel = Number(levelId) || 1;
 // const currentLevel = 4;
  const config = levelConfig[currentLevel as keyof typeof levelConfig];
  const [activeBadge, setActiveBadge] = useState<{name: string, icon: string} | null>(null);

  // 1. Define the completion logic first
  const handleLevelComplete = (scoreAtEndOfLevel: number, angryAtEndOfLevel: number) => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= 4) {
      navigate(`/level-start/${nextLevel}`, { 
        state: { 
          inheritedScore: scoreAtEndOfLevel,
          inheritedAngry: angryAtEndOfLevel 
        } 
      });
    } else {
      navigate("/game-over", { 
        state: { score: scoreAtEndOfLevel } 
      });
    }
  };

  const getBadgeIcon = (name: string) => {
  // Convert "First Order Up" to "first_order_up.png" or similar
  const fileName = name.toLowerCase().replace(/\s+/g, '_');
  try {
    return require(`../assets/badges/${fileName}.png`);
  } catch {
    return require(`../assets/badges/default_badge.png`);
  }
};

// Update your handleServe/Sync logic to call this
const showBadgePopup = (name: string) => {
  setActiveBadge({ 
    name, 
    icon: getBadgeIcon(name) 
  });
  
  // Hide it after 4 seconds
  setTimeout(() => {
    setActiveBadge(null);
  }, 4000);
};

  // 2. Single hook call - destructure everything here
const manager = useOrderManager(
  // This function only runs when the game ends, looking inside 'manager' for the latest values
  () => navigate("/game-over", { 
    state: { 
      score: manager.score, 
      ordersServed: manager.ordersServed 
    } 
  }),
  handleLevelComplete,
  showBadgePopup,
  currentLevel
);

// extract variables from manager so you can use them in your HTML
const {
  activeOrder,
  angryCustomerCount,
  score,
  tray,
  streak,
  feedback,
  handleServeOrder,
 handleManualCloseShop,
  advance,
  updateTray,
  clearTray,
  ordersServed: totalServed, // name match
  timeRemaining,
} = manager;

  // Load orders when level changes
  useEffect(() => {
    clearTray();
    advance();
  }, [currentLevel]);

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
        <div className="hud">
          <div className="hud-item"><span className="hud-label">Level:</span> {config.title}</div>
          <div className="hud-item"><span className="hud-label">Score:</span> {score}</div>
          <div className="hud-item"><span className="hud-label">Streak:</span> {streak}</div>
          <div className="hud-item">⏱️ {timeRemaining}s</div>
          <div className="hud-item">😡 {angryCustomerCount}/5</div>
        </div>

        <div className="order-tray-row">
          <Tray tray={tray} />
          {activeOrder && (
            <div className="order-container">
              <Order 
                order={activeOrder} 
                isActive={true} 
                timeRemaining={timeRemaining}
                currentLevel={currentLevel} 
              />
            </div>
          )}
        </div>
        
          <button className="serve-button" onClick={handleServeOrder}>
            SERVE ORDER
          </button>
          <div className="ingredients">
            <Ingredients  onSelect={updateTray} tray={tray} level={currentLevel} />
          </div>
        {/* Use the destructured feedback directly */}
        {feedback && <FeedbackToast feedback={feedback} />}

        <div className="bottom-actions">
          <button className="close-button-outline" onClick={handleManualCloseShop}>
            Close Shop
          </button>
        </div>

          {activeBadge && (
            <BadgeToast 
              badgeName={activeBadge.name} 
              iconPath={activeBadge.icon} 
              onClose={() => setActiveBadge(null)} 
            />
          )}

      </div>
    </PageContainer>
  );
};

export default Game;