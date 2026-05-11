import { Order as OrderType } from "@/types/Order";

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
import cinnamonImg from "@/assets/ingredients/cinnamon.png";
import sprinklesImg from "@/assets/ingredients/sprinkles.png";
import whippedImg from "@/assets/ingredients/whipped.png";

const ICONS: Record<string, string> = {
  small: smallImg,
  medium: mediumImg,
  large: largeImg,
  hot: hotImg,
  iced: icedImg,
  almond: almondImg,
  oat: oatImg,
  whole: wholeImg,
  vanilla: vanillaImg,
  caramel: caramelImg,
  mocha: mochaImg,
  cinnamon: cinnamonImg,
  sprinkles: sprinklesImg,
  whipped: whippedImg,
  whipped_cream: whippedImg,
  none: noMilkImg,
};

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
      <img src={ICONS[iconKey]} alt="" className="recipe-bullet-icon" />
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
    <div className="card warning-card active">
      <div className="timer-container">
        <div
          className="timer-bar"
          style={{ width: `${timePercent}%`, background: timePercent < 30 ? "#ef4444" : "#22c55e" }}
        />
      </div>

      <div>
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
    </div>
  );
};

export default Order;
