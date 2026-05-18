import { INGREDIENT_ICONS } from "@/data/ingredientIcons";
import { Order as OrderType } from "@/types/Order";

const RecipeRow = ({ value }: { value: string | undefined }) => {
  let display = value;
  let iconKey = value?.toLowerCase() || "none";
  if (display === "whipped_cream") {
    iconKey = "whipped";
    display = "Whipped";
  }
  if (!display || display === "none") {
    display = "None";
    iconKey = "none";
  }
  return (
    <div className="flex items-center gap-2">
      <img src={INGREDIENT_ICONS[iconKey]} alt="" className="recipe-bullet-icon" />
      <span className="recipe-text">{display}</span>
    </div>
  );
};

interface OrderProps {
  order: OrderType;
  timeRemaining: number;
  currentLevel: number;
}

export const Order = ({ order, timeRemaining, currentLevel }: OrderProps) => {
  const totalTime = order.timeLimit / 1000;
  const timePercent = totalTime > 0 ? Math.max(0, (timeRemaining / totalTime) * 100) : 0;

  return (
    <div className="card warning-card" style={{ gap: "4px" }}>
      <div className="timer-container">
        <div
          className="timer-bar"
          style={{ width: `${timePercent}%`, background: timePercent < 30 ? "#ef4444" : "#22c55e" }}
        />
      </div>

      <RecipeRow value={order.size} />
      <RecipeRow value={order.temp} />
      <RecipeRow value={order.milk} />
      {currentLevel >= 2 && <RecipeRow value={order.flavor} />}
      {currentLevel >= 3 &&
        (order.toppings && order.toppings.length > 0 ? (
          order.toppings.map((t) => <RecipeRow key={t} value={t} />)
        ) : (
          <RecipeRow value="none" />
        ))}
    </div>
  );
};

export default Order;
