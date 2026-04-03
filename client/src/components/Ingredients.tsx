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
        // This check prevents the "locked" logic if you haven't implemented it yet
        const isLocked = tray[category] !== undefined && tray[category] !== "";

        return (
          <div key={category} className="ingredient-row">
            <label className="category-label">{category}</label>
            <div className="options-grid">
              {options.map((option: string) => (
                <button
                  key={option}
                  type="button"
                  // Ensure these classes match your CSS exactly
                  className={`option-btn ${tray[category] === option ? "selected" : ""} ${isLocked && tray[category] !== option ? "disabled" : ""}`}
                  onClick={() => {
                    if (!isLocked) {
                      onSelect(category, option);
                    }
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ingredients;