import React from 'react';
import { levelConfig } from "../config/levelConfig";
import { Order } from "../types/Order";

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
  // Change 'string' to 'keyof Order' here:
  onSelect: (category: keyof Order, value: string) => void; 
  level: number;
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
  none: noMilkImg,
  "no-flavor": noFlavorImg,
  "no-milk": noMilkImg,
  cinnamon: cinnamonImg,
  sprinkles: sprinklesImg,
  whipped: whippedImg,
  whipped_cream: whippedImg, // Map both names to the same image
};

const Ingredients = ({ tray, onSelect, level }: IngredientsProps) => {
  //1. get config for current level
  const config = levelConfig[level as keyof typeof levelConfig];

  if (!config || !tray) return null;

  return (
    <div className="ingredients-grid">
      {Object.entries(config.ingredients).map(([category, options]) => {
        if (!options || (options as string[]).length === 0) return null;

        return (
          <div key={category} className="ingredient-row">
            <label className="category-label">{category}</label>
            <div className="options-grid">
              {(options as string[]).map((option: string) => {
                
                // ADD EXTRA SAFETY HERE: Use optional chaining ?.
                const isSelected = category === 'toppings' 
                  ? tray[category]?.includes(option)
                  : tray[category] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelect(category as any, option)} // Added as any to bypass strict type check if needed
                      >
                    {/* THE FIX: Check for the icon using lowercase and handling underscores */}
                    {ingredientIcons[option.toLowerCase().replace('-', '_')] || ingredientIcons[option.toLowerCase()] ? (
                      <img
                        src={ingredientIcons[option.toLowerCase()] || ingredientIcons[option.toLowerCase().replace('_', '')]}
                        alt={option}
                        className="ingredient-icon"
                      />
                    ) : (
                      /* Fallback if icon is still missing */
                      <div className="placeholder-icon" /> 
                    )}
                    <span className="option-text">{option.replace('_', ' ')}</span>
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