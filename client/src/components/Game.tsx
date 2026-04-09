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
  const { levelId } = useParams(); // Get level from URL
  const [currentLevel, setCurrentLevel] = useState<number>(Number(levelId) || 1);

  const orderManager = useOrderManager(
    () => navigate("/game-over"), 
    () => {
      const nextLevel = currentLevel + 1;
      if (nextLevel <= 4) {
        navigate(`/level-start/${nextLevel}`);
      } else {
        navigate("/game-over");
      }
    }
  );

  // DESTRUCTURE everything you need from orderManager
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

  // Sync Level from URL to state
  useEffect(() => {
    if (levelId) setCurrentLevel(Number(levelId));
  }, [levelId]);

  // Load orders when level changes
  useEffect(() => {
    const orders = levelOrders[currentLevel as keyof typeof levelOrders];
    if (orders) setSourceQueue(orders);
  }, [currentLevel, setSourceQueue]);

  useEffect(() => {
    if (sourceQueue.length > 0 && !activeOrder) {
      advance();
    }
  }, [sourceQueue, activeOrder, advance]);

  useEffect(() => {
    if (activeOrder) handleViewOrder(activeOrder);
  }, [activeOrder, handleViewOrder]);

  const activeIngredients = levelConfig[currentLevel as keyof typeof levelConfig].ingredients;

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
        <button className="close-shop-corner" onClick={handleCloseShop}>✕</button>

        <div className="hud">
          <span>Level: {currentLevel}</span>
          <span>Score: {score}</span>
          <span>Streak: {streak}</span>
          <span>⏱ {timeRemaining}s</span>
          <span>😠 {angryCustomerCount}/5</span>
        </div>

        <div className="order-tray-row">
          {activeOrder && <Order order={activeOrder} isActive={true} />}
          <Tray tray={tray} />
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