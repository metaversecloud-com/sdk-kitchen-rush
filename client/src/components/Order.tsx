import React from 'react';
import '../styles/Order.css';
import { OrderProps } from '../types/OrderProps';

// ICONS
import smallImg from "../assets/ingredients/small.png";
import mediumImg from "../assets/ingredients/medium.png";
import largeImg from "../assets/ingredients/large.png";
import hotImg from "../assets/ingredients/hot.png";
import icedImg from "../assets/ingredients/iced.png";
import almondImg from "../assets/ingredients/almond.png";
import oatImg from "../assets/ingredients/oat.png";
import wholeImg from "../assets/ingredients/whole.png";
import noMilkImg from "../assets/ingredients/no-milk.png";
import vanillaImg from "../assets/ingredients/vanilla.png";
import caramelImg from "../assets/ingredients/caramel.png";
import mochaImg from "../assets/ingredients/mocha.png";
import cinnamonImg from "../assets/ingredients/cinnamon.png";
import sprinklesImg from "../assets/ingredients/sprinkles.png";
import whippedImg from "../assets/ingredients/whipped.png";

const ingredientIcons: Record<string, string> = {
  almond: almondImg,
  caramel: caramelImg,
  vanilla: vanillaImg,
  mocha: mochaImg,
  whole: wholeImg,
  small: smallImg, 
  medium: mediumImg,
  large: largeImg,
  hot: hotImg,
  iced: icedImg, 
  oat: oatImg,
  none: noMilkImg,
  cinnamon: cinnamonImg,
  sprinkles: sprinklesImg,
  whipped: whippedImg,
};

// Added timeRemaining and currentLevel to the props destructuring
const Order = ({ order, isActive, timeRemaining, currentLevel }: any) => { 
  // Timer Logic
  const totalTime = order.timeLimit / 1000; 
  const timePercent = timeRemaining ? (timeRemaining / totalTime) * 100 : 0;

  return (
    <div className={isActive ? "order-card active" : "order-card"}>
      
      {/* 1. Timer Bar */}
      <div className="timer-bar-container" style={{height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px'}}>
        <div style={{
          width: `${timePercent}%`,
          height: '100%',
          background: timePercent < 30 ? '#ef4444' : '#22c55e',
          transition: 'width 1s linear'
        }} />
      </div>

      {/* 2. Visual Icon Row */}
      <div className="order-visual" style={{display: 'flex', gap: '5px', marginBottom: '8px', justifyContent: 'center'}}>
        <img src={ingredientIcons[order.size.toLowerCase()]} alt={order.size} className="ingredient-icon" style={{width: '20px'}} />
        <img src={ingredientIcons[order.temp.toLowerCase()]} alt={order.temp} className="ingredient-icon" style={{width: '20px'}} />
        <img src={ingredientIcons[order.milk.toLowerCase()]} alt={order.milk} className="ingredient-icon" style={{width: '20px'}} />
        {order.flavor && order.flavor !== 'none' && (
           <img src={ingredientIcons[order.flavor.toLowerCase()]} alt={order.flavor} className="ingredient-icon" style={{width: '20px'}} />
        )}
      </div>

      {/* 3. Order Details Grid */}
      <div className="order-details">
        <div className="detail-group">
          <label style={{fontSize: '10px', color: '#64748b'}}>RECIPE</label>
          <div className="item"><strong>{order.size} {order.temp}</strong></div>
          <div className="item">{order.milk} Milk</div>
          
          {order.flavor && order.flavor !== 'none' && (
            <div className="item" style={{color: '#b45309'}}>+ {order.flavor}</div>
          )}
        </div>

        {order.toppings && order.toppings.length > 0 && (
          <div className="detail-group" style={{marginTop: '4px', borderTop: '1px dashed #ccc', paddingTop: '4px'}}>
            <label style={{fontSize: '10px', color: '#64748b'}}>TOPPINGS</label>
            <div className="options-row" style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
              {order.toppings.map((t: string) => (
                <span key={t} className="option" style={{fontSize: '11px', background: '#f0fdf4', padding: '2px 4px', borderRadius: '4px'}}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;