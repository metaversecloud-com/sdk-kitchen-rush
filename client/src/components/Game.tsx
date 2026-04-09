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
import { levelOrders } from "../config/levelOrders";

import "../styles/Game.css";

const Game = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  
  // 1. Get current level from URL
  const currentLevel = Number(levelId) || 1;

  // 2. Get the specific config for this level
  const config = levelConfig[currentLevel as keyof typeof levelConfig];

  const orderManager = useOrderManager(
    () => navigate("/game-over"), 
    () => {
      const nextLevel = currentLevel + 1;
      if (nextLevel <= 4) {
        navigate(`/level-start/${nextLevel}`);
      } else {
        navigate("/game-over");
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
    timeRemaining,
  } = orderManager;

  // Load orders when level changes
  useEffect(() => {
    const orders = levelOrders[currentLevel as keyof typeof levelOrders];
    if (orders) {
      // Shuffle the orders before setting them
      const shuffled = [...orders].sort(() => Math.random() - 0.5);
      setSourceQueue(shuffled);
    }
  }, [currentLevel, setSourceQueue]);

  useEffect(() => {
    if (sourceQueue.length > 0 && !activeOrder) {
      advance();
    }
  }, [sourceQueue, activeOrder, advance]);

  useEffect(() => {
    // Every time a NEW order appears, start the timer
    if (activeOrder) {
      handleViewOrder(activeOrder);
    }
  }, [activeOrder]);

  // Use the ingredients from our config object
  const activeIngredients = config.ingredients;

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
        <button className="close-shop-corner" onClick={handleCloseShop}>✕</button>

        <div className="hud">
          <span>{config.title}</span> 
          <span>Score: {score}</span>
          <span>Streak: {streak}</span>
          <span>⏱ {timeRemaining}s</span>
          <span>😠 {angryCustomerCount}/5</span>
        </div>

      <div className="order-tray-row">
        {/* The Tray is now just a normal child, so justify-content: center hits it */}
        <Tray tray={tray} /> 
        
        {/* The Order is absolute, so it will snap to the top-right of the row */}
        {activeOrder && (
          <div className="order-container">
            <Order order={activeOrder} isActive={true} timeRemaining={timeRemaining} />
          </div>
        )}
      </div>

        <Ingredients
          tray={tray}
          onSelect={updateTray}
          availableIngredients={activeIngredients}
        />

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