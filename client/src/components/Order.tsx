import React from 'react';
import '../styles/Order.css';
import { OrderProps } from '../types/OrderProps';

// Added currentLevel to the interface so the component knows which level we are in
interface ExtendedOrderProps extends OrderProps {
  timeRemaining?: number;
  currentLevel: number; 
}

const Order = ({ order, isActive, timeRemaining, currentLevel }: ExtendedOrderProps) => {
  const totalTime = order.timeLimit / 1000; 
  const timePercent = timeRemaining ? (timeRemaining / totalTime) * 100 : 0;

  return (
    <div className={isActive ? "order-card active" : "order-card"}>
      {/* Timer Bar */}
      <div className="timer-bar-container" style={{height: '5px', background: '#eee', borderRadius: '5px', overflow: 'hidden'}}>
        <div style={{
          width: `${timePercent}%`,
          height: '100%',
          background: timePercent < 30 ? '#ff4d4d' : '#4CAF50',
          transition: 'width 1s linear'
        }} />
      </div>

      <p style={{fontSize: '10px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#64748b'}}>
        ORDER # {order.id}
      </p>

      <div className="order-details">
        {/* Main Drink Base */}
        <div className="item" style={{fontSize: '1.1rem', marginBottom: '4px'}}>
            <strong>{order.size} {order.temp}</strong>
        </div>
        <div className="item" style={{marginBottom: '8px', color: '#475569'}}>{order.milk} Milk</div>
        
        <hr style={{border: 'none', borderTop: '1px dashed #cbd5e1', margin: '8px 0'}} />

        {/* Force flavor display for Level 2 and above */}
        {currentLevel >= 2 && (
          <div className="item flavor" style={{ color: '#92400e', fontWeight: 'bold' }}>
            + {order.flavor && order.flavor !== "none" ? order.flavor : "none"} Shot
          </div>
        )}

        {/* TOPPINGS - Shows if level 3 or higher AND toppings exist */}
        {currentLevel >= 3 && order.toppings && order.toppings.length > 0 && (
          <div className="toppings" style={{fontSize: '12px', marginTop: '4px', color: '#166534'}}>
            <div style={{fontSize: '9px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase'}}>Toppings:</div>
            {order.toppings.map(t => (
                <div key={t} style={{paddingLeft: '4px'}}>• {t.replace('_', ' ')}</div>
            ))}
          </div>
        )}

        {/* If Level 3 but no toppings were ordered */}
        {currentLevel >= 3 && (!order.toppings || order.toppings.length === 0) && (
             <div style={{fontSize: '12px', color: '#94a3b8', fontStyle: 'italic'}}>No toppings</div>
        )}
      </div>
    </div>
  );
};

export default Order;