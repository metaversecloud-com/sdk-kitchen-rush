import { levelConfig } from "@/config/levelConfig";
import { getRecipeIcon, getRecipeLabel } from "@/data/ingredientIcons";
import { Order, Tray } from "@/types/Order";

const CATEGORY_ORDER: (keyof Order)[] = ["size", "temp", "milk", "flavor", "toppings"];

const CATEGORY_LABELS: Record<string, string> = {
  size: "Size",
  temp: "Temperature",
  milk: "Milk",
  flavor: "Flavor",
  toppings: "Toppings",
};

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

        // Single-select rows lock once filled. Toppings row stays open until
        // three are picked (the hard cap in useOrderManager.updateTray).
        const isMultiSelect = category === "toppings";
        const rowLocked = isMultiSelect
          ? (tray.toppings || []).length >= 3
          : typeof tray[category] === "string" && tray[category] !== "";

        return (
          <div key={category} className={`ingredient-row ${rowLocked ? "ingredient-row--locked" : ""}`}>
            <p className="ingredient-row__label">{CATEGORY_LABELS[category] || category}</p>
            <div className="grid grid-cols-4 gap-2">
              {options.map((option) => {
                const isSelected = isMultiSelect ? (tray.toppings || []).includes(option) : tray[category] === option;
                const disabled = rowLocked || (isMultiSelect && isSelected);
                const icon = getRecipeIcon(category, option);
                const label = getRecipeLabel(category, option);

                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelect(category, option)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                  >
                    {icon ? (
                      <img src={icon} alt="" className="ingredient-icon" draggable={false} />
                    ) : (
                      <div className="placeholder-icon" />
                    )}
                    <span className="option-text">{label}</span>
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
