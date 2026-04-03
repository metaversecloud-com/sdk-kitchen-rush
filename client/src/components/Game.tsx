import React, { useEffect } from "react";
import useOrderManager from "../hooks/useOrderManager";
import useGameManager from "../hooks/useGameManager";
import Order from "./Order";
import Ingredients from "./Ingredients";
import "../styles/Game.css";
import "../styles/Ingredients.css";

interface GameProps {
  orders: any[]; // you can type this later as Order[]
}

const Game = ({ orders }: GameProps) => {
  const orderManager = useOrderManager(
    () => console.log("game over"),
    () => console.log("level complete")
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
    timerId,
    clearTray,
    resetStreak,
    resetAngryCustomer,
  } = orderManager;

  const { handleCloseShop } = useGameManager(orderManager);

  // set orders from Level.tsx (NOT hardcoded anymore)
  useEffect(() => {
    setSourceQueue(orders);
  }, [orders]);

  // start first order
  useEffect(() => {
    if (sourceQueue.length > 0 && !activeOrder) {
      advance();
    }
  }, [sourceQueue]);

  // start timer when order changes
  useEffect(() => {
    if (activeOrder) handleViewOrder(activeOrder);
  }, [activeOrder]);

  return (
    <div className="game">
      <div className="hud">
        <span>Score: 0</span>
        <span>Streak: {streak}</span>
        <span>⏱ {timeRemaining}s</span>
        <span>😠 {angryCustomerCount}/5</span>
      </div>

      {activeOrder && <Order order={activeOrder} isActive={true} />}

      <button className="serve-button" onClick={handleServeOrder}>
        Serve
      </button>

      <Ingredients tray={tray} onSelect={updateTray} />

      <button className="close-button" onClick={handleCloseShop}>
        Close Shop
      </button>
    </div>
  );
};

export default Game;