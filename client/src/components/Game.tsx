<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
=======
import React, { useEffect, useState, useContext} from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams
import { GlobalStateContext } from "../context/GlobalContext";
>>>>>>> f57d2cfa1ff62a37be8707efb8971edb6111cf48

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
  const config = levelConfig[currentLevel as keyof typeof levelConfig];
  const [activeBadge, setActiveBadge] = useState<{name: string, icon: string} | null>(null);

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
    const fileName = name.toLowerCase().replace(/\s+/g, '_');
    try {
      return require(`../assets/badges/${fileName}.png`);
    } catch {
      return require(`../assets/badges/default_badge.png`);
    }
  };

  const showBadgePopup = (name: string) => {
    setActiveBadge({ 
      name, 
      icon: getBadgeIcon(name) 
    });
    
    setTimeout(() => {
      setActiveBadge(null);
    }, 4000);
  };

  const manager = useOrderManager(
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

<<<<<<< HEAD
  const {
    activeOrder,
    angryCustomerCount,
    score,
    tray,
    streak,
    feedback,
    handleServeOrder,
    handleCloseShop,
    advance,
    updateTray,
    clearTray,
    ordersServed: totalServed,
    timeRemaining,
    trackEvent,
    handleManualCloseShop
  } = manager;
=======
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
>>>>>>> f57d2cfa1ff62a37be8707efb8971edb6111cf48

  useEffect(() => {
    clearTray();
    advance();
  }, [currentLevel]);

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
        <div className="hud">
<<<<<<< HEAD
          <div className="admin-button" onClick={handleLeaderboardPage}>⚙️</div>
=======
>>>>>>> f57d2cfa1ff62a37be8707efb8971edb6111cf48
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

        <div className="ingredients">
          <Ingredients onSelect={updateTray} tray={tray} level={currentLevel} />
        </div>

        {feedback && <FeedbackToast feedback={feedback} />}

        <div className="bottom-actions">
          <button className="serve-button" onClick={handleServeOrder}>
            SERVE ORDER
          </button>
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