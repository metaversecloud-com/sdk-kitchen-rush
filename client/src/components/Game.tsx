import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import PageContainer from "./PageContainer";
import Order from "./Order";
import Ingredients from "./Ingredients";
import Tray from "./Tray";
import FeedbackToast from "./FeedbackToast"


// Hooks & Config
import useOrderManager from "../hooks/useOrderManager";
import { levelConfig } from "../config/levelConfig";
import { levelOrders } from "../config/levelOrders";

// Styles
import "../styles/Game.css";

// types
import { Feedback } from '../types/Feedback'


const Game = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number>(2);

  const handleLevelComplete = () => {
    if (currentLevel < 4) {
      setCurrentLevel(prev => prev + 1);
    } else {
      navigate("/game-over");
    }
  };

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
    sourceQueue,
    setSourceQueue,
    advance,
    updateTray,
    ordersServed,
    timeRemaining,
  } = useOrderManager(
    () => navigate("/game-over", { state: { score, ordersServed } }),
    handleLevelComplete
  );

  // Load orders when level changes
  useEffect(() => {
    const orders = levelOrders[currentLevel];
    if (orders) setSourceQueue(orders);
  }, [currentLevel]);

  // Advance queue when source queue updates and no active order
  useEffect(() => {
    if (sourceQueue.length > 0 && !activeOrder) {
      advance();
    }
  }, [sourceQueue, activeOrder]);

  // Start timer when active order changes
  useEffect(() => {
    if (activeOrder) handleViewOrder(activeOrder);
  }, [activeOrder]);

  const activeIngredients = levelConfig[currentLevel as keyof typeof levelConfig].ingredients;

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">

        {/* Close button */}
        <button className="close-shop-corner" onClick={handleCloseShop}>✕</button>

        {/* HUD */}
        <div className="hud">
          <span>Level: {currentLevel}</span>
          <span>Score: {score}</span>
          <span>Streak: {streak}</span>
          <span>⏱ {timeRemaining}s</span>
          <span>😠 {angryCustomerCount}/5</span>
        </div>

        {/* Order + Tray */}
        <div className="order-tray-row">
          {activeOrder && <Order order={activeOrder} isActive={true} />}
          <Tray tray={tray} />
        </div>

        <button className="serve-button" onClick={handleServeOrder}>
            SERVE ORDER
        </button>

        {/* Ingredients */}
        <Ingredients
          tray={tray}
          onSelect={updateTray}
          availableIngredients={activeIngredients}
        />

          {/* feedback  */}
        <FeedbackToast feedback={feedback} />

        {/* Bottom actions */}
        <div className="bottom-actions">
          <button className="close-button-outline" onClick={handleCloseShop}>
            Close Shop
          </button>
        </div>

      </div>
    </PageContainer>
  );
};

export default Game;