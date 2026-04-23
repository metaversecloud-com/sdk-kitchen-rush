import React from 'react';
import { levelConfig } from "../config/levelConfig";
import { Order } from "../types/Order";
import "../styles/Ingredients.css";

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
  // function to update selected ingredient in tray
  onSelect: (category: keyof Order, value: string) => void; 

  // current game level
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
  // get ingredient config based on current level
  const config = levelConfig[level as keyof typeof levelConfig];

  // if config or tray does not exist, render nothing
  if (!config || !tray) return null;

  const renderCategory = (category: string) => {
    // get all ingredient options for current category
    const options = config.ingredients[category as keyof typeof config.ingredients];

    // if no options exist for category, do not render it
    if (!options || (options as string[]).length === 0) return null;

    return (
      <div key={category} className="ingredient-row">
         {/* category title */}
        <label className="category-label">{category}</label>
         {/* display every ingredient option as a button */}
        <div className="options-grid">
          {(options as string[]).map((option: string) => {
            // check if current option is selected
            const isSelected =
              category === "toppings"
                ? tray[category]?.includes(option)
                : tray[category] === option;

            // normalize option so it matches icon keys
            const normalizedOption = option.toLowerCase();

            return (
              <button
                key={option}
                type="button"
                className={`option-btn ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(category as keyof Order, option)}
              >
                 {/* display ingredient icon if one exists */}
                {ingredientIcons[normalizedOption] ? (
                  <img
                    src={ingredientIcons[normalizedOption]}
                    alt={option}
                    className="ingredient-icon"
                  />
                ) : (
                  // fallback empty icon if image is missing
                  <div className="placeholder-icon" />
                )}
                 {/* display ingredient name */}
                <span className="option-text">{option.replace("_", " ")}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="ingredients-layout">
      {["size", "temp", "milk", "flavor", "toppings"].map(renderCategory)}
    </div>

  );
};

export default Ingredients;