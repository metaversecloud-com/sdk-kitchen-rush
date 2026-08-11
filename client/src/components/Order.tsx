import { getRecipeIcon, getRecipeLabel } from "@/data/ingredientIcons";
import { Order as OrderType, Tray as TrayType } from "@/types/Order";

interface RecipeRowProps {
  label: string;
  category: string;
  required: string | undefined;
  trayValue: string | undefined;
}

const RecipeRow = ({ label, category, required, trayValue }: RecipeRowProps) => {
  const reqIcon = getRecipeIcon(category, required);
  const reqLabel = getRecipeLabel(category, required);
  const trayIcon = getRecipeIcon(category, trayValue);
  const isFilled = !!trayValue;

  return (
    <div className="recipe-row">
      <div className="recipe-row__label">{label}</div>
      <div className="recipe-row__req">
        {reqIcon ? (
          <img src={reqIcon} alt="" className="recipe-row__icon" draggable={false} />
        ) : (
          <div className="recipe-row__icon" />
        )}
        <span className="recipe-row__text">{reqLabel}</span>
      </div>
      <div className={`recipe-row__slot ${isFilled ? "recipe-row__slot--filled" : ""}`} aria-label={isFilled ? `${label} added` : `${label} missing`}>
        {trayIcon ? (
          <img src={trayIcon} alt="" className="recipe-row__icon" draggable={false} />
        ) : null}
      </div>
    </div>
  );
};

interface OrderProps {
  order: OrderType;
  tray: TrayType;
  currentLevel: number;
}

export const Order = ({ order, tray, currentLevel }: OrderProps) => {
  const trayToppings = tray.toppings || [];
  const orderToppings = order.toppings || [];

  return (
    <div className="recipe-panel">
      <div className="recipe-panel__head">
        <span className="recipe-panel__head-col">Order</span>
        <span className="recipe-panel__head-col">Your tray</span>
      </div>
      <RecipeRow label="Size" category="size" required={order.size} trayValue={tray.size || ""} />
      <RecipeRow label="Temp" category="temp" required={order.temp} trayValue={tray.temp || ""} />
      <RecipeRow label="Milk" category="milk" required={order.milk} trayValue={tray.milk || ""} />
      {currentLevel >= 2 && (
        <RecipeRow label="Flavor" category="flavor" required={order.flavor} trayValue={tray.flavor || ""} />
      )}
      {currentLevel >= 3 &&
        (orderToppings.length > 0
          ? orderToppings.map((topping, i) => {
              const has = trayToppings.includes(topping);
              return (
                <RecipeRow
                  key={`${topping}-${i}`}
                  label={i === 0 ? "Toppings" : ""}
                  category="toppings"
                  required={topping}
                  trayValue={has ? topping : ""}
                />
              );
            })
          : (
              <RecipeRow label="Toppings" category="toppings" required="none" trayValue="none" />
            ))}
    </div>
  );
};

export default Order;
