import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams

// Components
import PageContainer from "./PageContainer";
import Order from "./Order";
import Ingredients from "./Ingredients";
import Tray from "./Tray";

// Hooks & Config
import useOrderManager from "../hooks/useOrderManager";
import { levelConfig } from "../config/levelConfig";

import "../styles/Game.css";

const Game = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  
  // 1. Get current level from URL
  const currentLevel = Number(levelId) || 1;

  // 2. Get the specific config for this level
  const config = levelConfig[currentLevel as keyof typeof levelConfig];
  console.log("Current Level:", currentLevel, "Config Found:", config);

  const orderManager = useOrderManager(
      () => navigate("/game-over"), 
      (scoreAtEndOfLevel: number, angryAtEndOfLevel: number) => { 
        const nextLevel = currentLevel + 1;
        if (nextLevel <= 4) {
          // Send BOTH pieces of data to the next level
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
      },
      currentLevel
    );

  const {
    activeOrder,
    angryCustomerCount,
    score,
    tray,
    streak,
    handleServeOrder,
    handleViewOrder,
    handleCloseShop,
    sourceQueue,
    setSourceQueue,
    advance,
    updateTray,
    clearTray,
    timeRemaining,
  } = orderManager;

  // Load orders when level changes
useEffect(() => {
    // 1. Reset cup for new level
    clearTray();
    
    // 2. Get first order
    advance();

    // 3. IMPORTANT: Timer logic is handled automatically when 
  }, [currentLevel]);

  // Use the ingredients from our config object
  const activeIngredients = config.ingredients;

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
          {/* 1. THE HUD */}
          <div className="hud">
            {/* Change currentLevel.title to config.title */}
            <div className="hud-item"><span className="hud-label">Level:</span> {config.title}</div>
            <div className="hud-item"><span className="hud-label">Score:</span> {score}</div>
            <div className="hud-item"><span className="hud-label">Streak:</span> {streak}</div>
            <div className="hud-item">⏱️ {timeRemaining}s</div>
            <div className="hud-item">😡 {angryCustomerCount}/5</div>
          </div>

          {/* 2. THE PLAY AREA: Tray is center, Order is top-right */}
          <div className="order-tray-row">
            <Tray tray={tray} />
            
            {activeOrder && (
              <div className="order-container">
                <Order 
                  order={activeOrder} 
                  isActive={true} 
                  timeRemaining={timeRemaining}
                  currentLevel={currentLevel} // CRITICAL: Fixes flavor display
                />
              </div>
            )}
          </div>

          {/* 3. INGREDIENTS */}
          <Ingredients onSelect={updateTray} currentTray={tray} level={currentLevel} />

          {/* 4. ACTION BUTTONS */}
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