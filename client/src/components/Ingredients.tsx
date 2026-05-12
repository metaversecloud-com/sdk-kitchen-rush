import { levelConfig } from "@/config/levelConfig";
import { getIngredientIcon } from "@/data/ingredientIcons";
import { Order, Tray } from "@/types/Order";

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
          <div key={category} className="mb-1">
            <p className="p2 uppercase py-1">{category}</p>
            <div className="grid grid-cols-4 gap-2">
              {options.map((option) => {
                const isSelected =
                  category === "toppings" ? (tray.toppings || []).includes(option) : tray[category] === option;
                const icon = getIngredientIcon(option);

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
