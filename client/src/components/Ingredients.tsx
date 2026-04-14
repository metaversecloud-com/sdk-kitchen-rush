import React from 'react';
import { levelConfig } from "../config/levelConfig";

// SIZES
import smallImg from "../assets/ingredients/small.png";
import mediumImg from "../assets/ingredients/medium.png";
import largeImg from "../assets/ingredients/large.png";
// TEMP
import hotImg from "../assets/ingredients/hot.png";
import icedImg from "../assets/ingredients/iced.png";
// MILK
import almondImg from "../assets/ingredients/almond.png";
import oatImg from "../assets/ingredients/oat.png";
import wholeImg from "../assets/ingredients/whole.png";
import noMilkImg from "../assets/ingredients/no-milk.png";
// FLAVOR
import vanillaImg from "../assets/ingredients/vanilla.png";
import caramelImg from "../assets/ingredients/caramel.png";
import mochaImg from "../assets/ingredients/mocha.png";
import noFlavorImg from "../assets/ingredients/no-flavor.png";
// TOPPINGS
import cinnamonImg from "../assets/ingredients/cinnamon.png";
import sprinklesImg from "../assets/ingredients/sprinkles.png";
import whippedImg from "../assets/ingredients/whipped.png";

interface IngredientsProps {
  tray: any;
  onSelect: (category: string, value: string) => void;
  level: number; // Pass the level number from Game.tsx
}

// Icon Mapping
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
  none: noMilkImg, // Note: LevelConfig should ideally use "no-milk" or "no-flavor"
  cinnamon: cinnamonImg,
  sprinkles: sprinklesImg,
  whipped: whippedImg,
};

const Ingredients = ({ tray, onSelect, level }: IngredientsProps) => {
  // 1. Get the config for the current level
  const config = levelConfig[level as keyof typeof levelConfig];

  if (!config) return null;

  return (
    <div className="ingredients-grid">
      {Object.entries(config.ingredients).map(([category, options]) => {
        // Skip if category has no options for this level
        if (!options || (options as string[]).length === 0) return null;

        return (
          <div key={category} className="ingredient-row">
            <label className="category-label">{category}</label>
            <div className="options-grid">
              {(options as string[]).map((option: string) => {
                // Determine if this specific button is "selected"
                // Toppings are an array, others are strings
                const isSelected = category === 'toppings' 
                  ? tray[category]?.includes(option)
                  : tray[category] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelect(category, option)}
                  >
                    {ingredientIcons[option] && (
                      <img
                        src={ingredientIcons[option]}
                        alt={option}
                        className="ingredient-icon"
                      />
                    )}
                    <span className="option-text">{option}</span>
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