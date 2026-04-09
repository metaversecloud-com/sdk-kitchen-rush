import React from "react";
import "../styles/Ingredients.css";
import { Order } from "../types/Order";

interface IngredientsProps {
  // Using Partial<Order> matches how you handle the tray state in the hook
  tray: Partial<Order>; 
  // Changed category from string to keyof Order to fix the type mismatch
  onSelect: (category: keyof Order, value: string) => void;
  availableIngredients: any;
}

const Ingredients = ({ tray, onSelect, availableIngredients }: IngredientsProps) => {
  return (
    <div className="ingredients-container">
      {Object.entries(availableIngredients).map(([category, options]) => {
        // We cast 'category' as keyof Order so TS knows it can index the 'tray'
        const catKey = category as keyof Order;
        
        // This check prevents changing an ingredient once it's picked (unless it's reset)
        const isLocked = tray[catKey] !== undefined && tray[catKey] !== "";

        // If the config has an empty array (like 'flavor' in Level 1), don't render the row
        if (!Array.isArray(options) || options.length === 0) return null;

        return (
          <div key={category} className="ingredient-row">
            <label className="category-label">{category}</label>
            <div className="options-grid">
              {(options as string[]).map((option: string) => {
                const isSelected = tray[catKey] === option;
                
                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""} ${
                      isLocked && !isSelected ? "disabled" : ""
                    }`}
                    onClick={() => {
                      if (!isLocked) {
                        onSelect(catKey, option);
                      }
                    }}
                  >
                    {option.replace("_", " ")}
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