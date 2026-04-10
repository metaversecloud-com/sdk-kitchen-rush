import React from 'react';
import { levelConfig } from "../config/levelConfig";

const Ingredients = ({ onSelect, currentTray, level }: { onSelect: any, currentTray: any, level: number }) => {
  // Use the number level to get the config
  const config = levelConfig[level as keyof typeof levelConfig];

  console.log("Ingredients Component - Level received:", level);
  console.log("Ingredients Component - Config found:", config);

  if (!config || !config.ingredients) {
    return <div className="loading">Loading ingredients for Level {level}...</div>;
  }

  return (
    <div className="ingredients-grid">
      {Object.entries(config.ingredients).map(([category, options]) => {
        // Skip flavor/toppings if the array is empty (like in Level 1)
        if (!options || options.length === 0) return null;

        return (
          <div key={category} className="ingredient-category">
            <h3 className="category-title">{category}</h3>
            <div className="options-row">
              {options.map((option: string) => {
                // Toppings are an array, everything else is a string
                const isActive = Array.isArray(currentTray[category])
                  ? currentTray[category].includes(option)
                  : currentTray[category] === option;

                return (
                  <button
                    key={option}
                    className={`ingredient-btn ${isActive ? "active" : ""}`}
                    onClick={() => onSelect(category, option)}
                  >
                    {option.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ingredients;