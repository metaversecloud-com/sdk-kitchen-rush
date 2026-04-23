import React from 'react';
import '../styles/Order.css';

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

// match ingredient names to their icon images
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

const Order = ({ order, isActive, timeRemaining, currentLevel }: any) => { 
  // convert time limit from milliseconds to seconds
  const totalTime = order.timeLimit / 1000; 
  // calculate how much time is left as a percentage
  const timePercent = timeRemaining ? (timeRemaining / totalTime) * 100 : 0;

  const RecipeRow = ({ value, minLevel = 1 }: { value: string | undefined, minLevel?: number }) => {
    // Hidden if the level isn't high enough yet
    if (currentLevel < minLevel) return null;

    let displayValue = value;
    let iconKey = value?.toLowerCase() || "none";

     // rename whipped_cream so it displays better in UI
    if (displayValue === "whipped_cream") {
      iconKey = "whipped"; 
      displayValue = "Whipped";
    }

    // if no value exists, display none with no-milk icon
    if (!displayValue || displayValue === "" || displayValue === "No" || displayValue === "none") {
      displayValue = "None";
      iconKey = "none";
    }

    return (
      <div className="recipe-row">
         {/* display ingredient icon */}
        <img src={ingredientIcons[iconKey]} alt="" className="recipe-bullet-icon" />
         {/* display ingredient text */}
        <span className="recipe-text">{displayValue}</span>
      </div>
    );
  };

  return (
    <div className={isActive ? "order-card active" : "order-card"}>
      <div className="timer-container">
        <div className="timer-bar" style={{ width: `${timePercent}%`, background: timePercent < 30 ? '#ef4444' : '#22c55e' }} />
      </div>

      <label className="recipe-label">Recipe</label>

      <div className="order-details-list">
        <RecipeRow value={order.size} />
        <RecipeRow value={order.temp} />
        <RecipeRow value={order.milk} />
        
        {/* Only show Flavor row if Level 2 or higher */}
        <RecipeRow value={order.flavor} minLevel={2} />
        
        {/* Toppings Section: Only show if Level 3 or higher */}
        {currentLevel >= 3 && (
          order.toppings && order.toppings.length > 0 ? (
            order.toppings.map((t: string) => {
              const isWhipped = t === "whipped_cream";
              return (
                <div className="recipe-row" key={t}>
                  <img src={ingredientIcons[isWhipped ? "whipped" : t.toLowerCase()]} alt="" className="recipe-bullet-icon" />
                  <span className="recipe-text">{isWhipped ? "Whipped" : t}</span>
                </div>
              );
            })
          ) : (
            <div className="recipe-row">
              <img src={ingredientIcons["none"]} alt="" className="recipe-bullet-icon" />
              <span className="recipe-text">No Toppings</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Order;