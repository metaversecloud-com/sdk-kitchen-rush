// calls both hooks
import React, { useEffect } from 'react';
import useOrderManager from '../hooks/useOrderManager';
import Order from './Order';
import Ingredients from './Ingredients';
import { LEVEL_ONE_ORDERS } from '../data/Coffee';

const Game = () => {
  const {
    activeOrder,
    angryCustomerCount,
    tray,
    streak,
    handleServeOrder,
    handleViewOrder,
    setSourceQueue,
  } = useOrderManager(
    () => console.log('game over'),
    () => console.log('level complete')
  );

  useEffect(() => {
    setSourceQueue(LEVEL_ONE_ORDERS);
  }, []);

  useEffect(() => {
    if (activeOrder) handleViewOrder(activeOrder);
  }, [activeOrder]);

  return (
    <div className="game">
      <div className="hud">
        <span>Score: 0</span>
        <span>Streak: {streak}</span>
        <span>Angry Customers: {angryCustomerCount}</span>
      </div>
      {activeOrder && (
        <Order order={activeOrder} isActive={true} />
      )}
      <Ingredients
        tray={tray}
        onSelect={(category, value) => console.log(category, value)}
      />
      <button onClick={handleServeOrder}>Serve</button>
    </div>
  );
};

export default Game;