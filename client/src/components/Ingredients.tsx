import React from "react";
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
  onSelect: (category: string, value: string) => void;
  availableIngredients: any;
}

const ingredientIcons = {
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
  // none: noFlavorImg,
  cinnamon: cinnamonImg,
  sprinkles: sprinklesImg,
  whipped: whippedImg,
};

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
                  className={`option-btn ${tray[category] === option ? "selected" : ""} ${
                    isLocked && tray[category] !== option ? "disabled" : ""
                  }`}
                  onClick={() => {
                    if (!isLocked) {
                      onSelect(category, option);
                    }
                  }}
                >
                  {ingredientIcons[option] && (
                    <img
                      src={ingredientIcons[option]}
                      alt={option}
                      className="ingredient-icon"
                    />
                  )}
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