import { levelConfig } from "@/config/levelConfig";
import { Order, Tray } from "@/types/Order";

import smallImg from "@/assets/ingredients/small.png";
import mediumImg from "@/assets/ingredients/medium.png";
import largeImg from "@/assets/ingredients/large.png";
import hotImg from "@/assets/ingredients/hot.png";
import icedImg from "@/assets/ingredients/iced.png";
import almondImg from "@/assets/ingredients/almond.png";
import oatImg from "@/assets/ingredients/oat.png";
import wholeImg from "@/assets/ingredients/whole.png";
import noMilkImg from "@/assets/ingredients/no-milk.png";
import vanillaImg from "@/assets/ingredients/vanilla.png";
import caramelImg from "@/assets/ingredients/caramel.png";
import mochaImg from "@/assets/ingredients/mocha.png";
import noFlavorImg from "@/assets/ingredients/no-flavor.png";
import cinnamonImg from "@/assets/ingredients/cinnamon.png";
import sprinklesImg from "@/assets/ingredients/sprinkles.png";
import whippedImg from "@/assets/ingredients/whipped.png";

const ICONS: Record<string, string> = {
  "small": smallImg,
  "medium": mediumImg,
  "large": largeImg,
  "hot": hotImg,
  "iced": icedImg,
  "almond": almondImg,
  "oat": oatImg,
  "whole": wholeImg,
  "vanilla": vanillaImg,
  "caramel": caramelImg,
  "mocha": mochaImg,
  "cinnamon": cinnamonImg,
  "sprinkles": sprinklesImg,
  "whipped": whippedImg,
  "whipped_cream": whippedImg,
  "none": noMilkImg,
  "no-flavor": noFlavorImg,
  "no-milk": noMilkImg,
};

const CATEGORY_ORDER: (keyof Order)[] = ["size", "temp", "milk", "flavor", "toppings"];

interface IngredientsProps {
  tray: Tray;
  level: number;
  onSelect: (category: keyof Order, value: string) => void;
}

export const Ingredients = ({ tray, level, onSelect }: IngredientsProps) => {
  const config = levelConfig[level as keyof typeof levelConfig];
  if (!config) return null;

  return (
    <div className="ingredients">
      {CATEGORY_ORDER.map((category) => {
        const options = config.ingredients[category as keyof typeof config.ingredients] as readonly string[];
        if (!options || options.length === 0) return null;

        return (
          <div key={category} className="mb-2">
            <p className="p2 uppercase py-1">{category}</p>
            <div className="grid grid-cols-4 gap-2">
              {options.map((option) => {
                const isSelected =
                  category === "toppings" ? (tray.toppings || []).includes(option) : tray[category] === option;
                const icon = ICONS[option.toLowerCase()];

                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelect(category, option)}
                  >
                    {icon ? (
                      <img src={icon} alt={option} className="ingredient-icon" />
                    ) : (
                      <div className="placeholder-icon" />
                    )}
                    <span className="option-text">{option.replace("_", " ")}</span>
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
