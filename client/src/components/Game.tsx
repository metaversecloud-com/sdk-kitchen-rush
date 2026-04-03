import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import PageContainer from "./PageContainer"; 
import Order from "./Order";
import Ingredients from "./Ingredients";

// Hooks & Config
import useOrderManager from "../hooks/useOrderManager";
import useGameManager from "../hooks/useGameManager";
import { levelConfig } from "../config/levelConfig";

// Styles
import "../styles/Game.css";

interface GameProps {
  orders: any[]; 
}

const Game = ({ orders }: GameProps) => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  const orderManager = useOrderManager(
    () => navigate("/game-over"), 
    () => {
      if (currentLevel < 4) {
        setCurrentLevel(prev => prev + 1);
      } else {
        navigate("/game-over");
      }
    }
  );

  const {
    activeOrder,
    angryCustomerCount,
    tray,
    streak,
    handleServeOrder,
    handleViewOrder,
    sourceQueue,
    setSourceQueue,
    advance,
    updateTray,
    timeRemaining,
  } = orderManager;

  const { handleCloseShop } = useGameManager(orderManager);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setSourceQueue(orders);
    }
  }, [orders]);

  useEffect(() => {
    if (sourceQueue.length > 0 && !activeOrder) {
      advance();
    }
  }, [sourceQueue, activeOrder]);

  useEffect(() => {
    if (activeOrder) {
      handleViewOrder(activeOrder);
    }
  }, [activeOrder]);

  const activeIngredients = levelConfig[currentLevel as keyof typeof levelConfig].ingredients;

  return (
    <PageContainer isLoading={false}>
      <div className="game-screen-wrapper">
        
        {/* Absolute X button */}
        <button className="close-shop-corner" onClick={handleCloseShop}>✕</button>

        {/* Top HUD */}
        <div className="hud">
          <span>Level: {currentLevel}</span>
          <span>Streak: {streak}</span>
          <span>⏱ {timeRemaining}s</span>
          <span>😠 {angryCustomerCount}/5</span>
        </div>

        {/* Order Card */}
        <div className="order-area">
          {activeOrder && <Order order={activeOrder} isActive={true} />}
        </div>

        {/* Ingredients List */}
        <Ingredients 
          tray={tray} 
          onSelect={updateTray} 
          availableIngredients={activeIngredients} 
        />

        {/* Fixed Bottom Action Bar */}
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