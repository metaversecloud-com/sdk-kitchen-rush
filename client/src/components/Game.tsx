import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams

// Components
import PageContainer from "./PageContainer";
import Order from "./Order";
import Ingredients from "./Ingredients";
import Tray from "./Tray";
import FeedbackToast from "./FeedbackToast"

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

  const handleLeaderboardPage = () => {
    navigate('/leaderboard-page')
  }

  // 2. Single hook call - destructure everything here
  const {
    activeOrder,
    angryCustomerCount,
    score,
    tray,
    streak,
    feedback,
    handleServeOrder,
    handleViewOrder,
    handleCloseShop,
    advance,
    updateTray,
    clearTray,
    ordersServed,
    timeRemaining,
  } = useOrderManager(
    () => navigate("/game-over", { state: { score, ordersServed } }),
    handleLevelComplete,
    currentLevel
  );

  // Load orders when level changes
  useEffect(() => {
    clearTray();
    advance();
  }, [currentLevel]);

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
        <div className="hud">
          <div className="hud-item"onClick={handleLeaderboardPage}>⚙️</div>
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

        <Ingredients onSelect={updateTray} tray={tray} level={currentLevel} />

        {/* Use the destructured feedback directly */}
        {feedback && <FeedbackToast feedback={feedback} />}

        <div className="bottom-actions">
          <button className="serve-button" onClick={handleServeOrder}>
            SERVE ORDER
          </button>
          <button className="close-button-outline" onClick={handleCloseShop}>
            Close Shop
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default Game;