import React from 'react';
import '../styles/Order.css';
import { OrderProps } from '../types/OrderProps';

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
      <div className="timer-bar-container" style={{height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden'}}>
        <div style={{
          width: `${timePercent}%`,
          height: '100%',
          background: timePercent < 30 ? '#ef4444' : '#22c55e',
          transition: 'width 1s linear'
        }} />
      </div>

      <p style={{fontSize: '10px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#64748b'}}>
        ORDER # {order.id}
      </p>

      <div className="order-details">
        {/* NEWLINES: Each property gets its own <div> to force stacking */}
        <div className="item" style={{fontSize: '1.1rem'}}><strong>{order.size}</strong></div>
        <div className="item" style={{fontSize: '1.1rem', marginBottom: '4px'}}><strong>{order.temp}</strong></div>
        <div className="item" style={{marginBottom: '8px', color: '#475569'}}>{order.milk} Milk</div>
        
        <hr style={{border: 'none', borderTop: '1px dashed #cbd5e1', margin: '8px 0'}} />

        {/* FLAVOR: Forced display for Level 2+ */}
        {currentLevel >= 2 && (
          <div className="item flavor" style={{ color: '#92400e', fontWeight: 'bold', marginBottom: '4px' }}>
            + {(order.flavor && order.flavor.toLowerCase() !== "none") ? order.flavor : "None"} Shot
          </div>
        )}

        {/* TOPPINGS: Forced layout for Level 3+ */}
        {currentLevel >= 3 && (
          <div className="toppings" style={{fontSize: '12px', marginTop: '4px', color: '#166534'}}>
            <div style={{fontSize: '9px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase'}}>Toppings:</div>
            {order.toppings && order.toppings.length > 0 ? (
                order.toppings.map(t => (
                    <div key={t} style={{paddingLeft: '4px'}}>• {t.replace('_', ' ')}</div>
                ))
            ) : (
                <div style={{fontSize: '12px', color: '#94a3b8', fontStyle: 'italic'}}>No toppings</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;