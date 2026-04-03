import React, { useEffect } from 'react';
import useOrderManager from '../hooks/useOrderManager';
import Order from './Order';
import Ingredients from './Ingredients';
import { LEVEL_ONE_ORDERS } from '../data/Coffee';
import '../styles/Game.css';
import '../styles/Ingredients.css';
import {useNavigate} from "react-router-dom"

const Game = () => {
  const navigate = useNavigate();
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
  } = useOrderManager(
    () => navigate('/gameover'),
    () => console.log('level complete')
  );

  useEffect(() => {
    setSourceQueue(LEVEL_ONE_ORDERS);
  }, []);

  useEffect(() => {
    if (sourceQueue.length > 0 && !activeOrder) {
      advance();
    }
  }, [sourceQueue]);

  useEffect(() => {
    if (activeOrder) handleViewOrder(activeOrder);
  }, [activeOrder]);

  return (
    <div className="game">
      <div className="hud">
        <span>Score: {score}</span>
        <span>Streak: {streak}</span>
        <span>⏱ {timeRemaining}s</span>
        <span>😠 {angryCustomerCount}/5</span>
      </div>
      {activeOrder && (
        <Order order={activeOrder} isActive={true} />
      )}
      <button className="serve-button" onClick={handleServeOrder}>Serve</button>
      <Ingredients
        tray={tray}
        onSelect={updateTray}
      />
      <button className="close-button" onClick={handleCloseShop}>Close Shop</button>
    </div>
  );
};

export default Game;