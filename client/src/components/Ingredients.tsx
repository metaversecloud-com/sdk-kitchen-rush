import React from "react";
import "../styles/Ingredients.css";

interface IngredientsProps {
  tray: any;
  onSelect: (category: string, value: string) => void;
  availableIngredients: any;
}

const Ingredients = ({ tray, onSelect, availableIngredients }: IngredientsProps) => {
  return (
    <div className="ingredients-container">
      {Object.entries(availableIngredients).map(([category, options]: [string, any]) => {
        // Check if the player has already picked something for this category
        const isLocked = tray[category] !== undefined && tray[category] !== "";

        return (
          <div key={category} className={`ingredient-row ${isLocked ? "locked" : ""}`}>
            <label className="category-label">
              {category} {isLocked && "🔒"} 
            </label>
            <div className="options-grid">
              {options.map((option: string) => {
                const isActive = tray[category] === option;

                return (
                  <button
                    key={option}
                    // Add a 'disabled' class if a choice was already made
                    className={`option-btn ${isActive ? "selected" : ""} ${isLocked && !isActive ? "disabled" : ""}`}
                    onClick={() => {
                      // ONLY call onSelect if the category is currently empty
                      if (!isLocked) {
                        onSelect(category, option);
                      }
                    }}
                  >
                    {option}
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