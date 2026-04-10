// renders order card visually
// need icons for each ingredient
// a timer progress bar
// a visual distinction;
import '../styles/Order.css';
import { OrderProps } from '../types/OrderProps'

// SIZE
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

const ingredientIcons: Record <string, string> = {
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

const Order = ({order, isActive}: OrderProps) => { 
   console.log("ORDER VALUES:", order);
    console.log("ICON LOOKUP:", {
    size: ingredientIcons[order.size],
    temp: ingredientIcons[order.temp],
    milk: ingredientIcons[order.milk],
    flavor: ingredientIcons[order.flavor],
    toppings: order.toppings?.map(t => ingredientIcons[t])
  });
    return (
      <div className={isActive ? "order-card active" : "order-card"}>

      {/* HEADER */}
      <div className="order-header">
        <h3>Current Order</h3>

        {/* {isActive && (
          <div className="timer-bar">
            <div 
            className="timer-fill"
            style={{ '--timer-duration': `${order.timeLimit / 1000}s` } as React.CSSProperties}
          />
          </div>
        )} */}
      </div>

      {/* VISUALIZATION BOX */}
      <div className="order-visual">
        {/* Replace these with icons later */}
        <div className="visual-item">
          <img src={ingredientIcons[order.size.toLowerCase()]} alt={order.size} className="ingredient-icon" />
        </div>

         <div className="visual-item">
          <img src={ingredientIcons[order.temp.toLowerCase()]} alt={order.temp} className="ingredient-icon" />
        </div>
        <div className="visual-item">
          <img src={ingredientIcons[order.milk.toLowerCase()]} alt={order.milk} className="ingredient-icon" />
        </div>

        {order.flavor && (
          <div className="visual-item">
            <img src={ingredientIcons[order.flavor.toLowerCase()]} alt={order.flavor} className="ingredient-icon" />
          </div>
        )}

        {order.toppings?.map(t => (
          <div className="visual-item" key={t}>
            <img src={ingredientIcons[t.toLowerCase()]} alt={t} className="ingredient-icon" />
          </div>
        ))}
      </div>
      

      {/* INGREDIENT SECTIONS */}
      <div className="order-details">

        <div className="detail-group">
          <label>Size</label>
          <div className="options-row">
            <span className="option">
              <img src={ingredientIcons[order.size.toLowerCase()]} alt={order.size} className="ingredient-icon" />
            </span>
          </div>
        </div>

        <div className="detail-group">
          <label>Temp</label>
          <div className="options-row">
            <span className="option">
              <img src={ingredientIcons[order.temp.toLowerCase()]} alt={order.temp} className="ingredient-icon" />
            </span>
          </div>
        </div>

        <div className="detail-group">
          <label>Milk</label>
          <div className="options-row">
            <span className="option">
              <img src={ingredientIcons[order.milk.toLowerCase()]} alt={order.milk} className="ingredient-icon" />
            </span>
          </div>
        </div>

        {order.flavor && (
          <div className="detail-group">
            <label>Flavor</label>
            <div className="options-row">
              <span className="option">
              <img src={ingredientIcons[order.flavor.toLowerCase()]} alt={order.flavor} className="ingredient-icon" />
            </span>
            </div>
          </div>
        )}

        {order.toppings && (
          <div className="detail-group">
            <label>Toppings</label>
            <div className="options-row">
              {order.toppings.map(t => (
                <span className="option" key={t}>
                  <img
                    src={ingredientIcons[t.toLowerCase()]}
                    alt={t}
                    className="ingredient-icon"
                  />
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>

    );
};

export default Order