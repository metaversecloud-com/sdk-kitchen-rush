import '../styles/Order.css';
import { TrayProps } from '../types/TrayProps';

// ICONS
import smallImg from "../assets/ingredients/small.png";
import mediumImg from "../assets/ingredients/medium.png";
import largeImg from "../assets/ingredients/large.png";
import hotImg from "../assets/ingredients/hot.png";
import icedImg from "../assets/ingredients/iced.png";
import almondImg from "../assets/ingredients/almond.png";
import oatImg from "../assets/ingredients/oat.png";
import wholeImg from "../assets/ingredients/whole.png";
import noMilkImg from "../assets/ingredients/no-milk.png";
import vanillaImg from "../assets/ingredients/vanilla.png";
import caramelImg from "../assets/ingredients/caramel.png";
import mochaImg from "../assets/ingredients/mocha.png";
import cinnamonImg from "../assets/ingredients/cinnamon.png";
import sprinklesImg from "../assets/ingredients/sprinkles.png";
import whippedImg from "../assets/ingredients/whipped.png";

const Tray = ({ tray }: TrayProps) => {
  // map ingredient values to corresponding icons
  const iconMap: Record<string, string> = {
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
    whipped_cream: whippedImg, // matches backend data format
    none: noMilkImg,
    "no-milk": noMilkImg,
    "no-flavor": noMilkImg,
  };

  // helper function to safely get icon (handles undefined + case differences)
  const getIcon = (val: string | undefined) => {
    if (!val) return null;
    return iconMap[val.toLowerCase()] || null;
  };

  // check if tray is empty (no selections yet)
  const isEmpty = !tray.size && !tray.temp && !tray.milk && !tray.flavor;

  return (
    <div className="tray-container">
      <div className="order-header"><h3>Your Tray</h3></div>
        <div className="order-visual">
          {isEmpty ? (
             // display placeholder if tray is empty
            <span className="empty-label">empty</span>
          ) : (
            <>
              {/* display selected size */}
              {tray.size && <img src={getIcon(tray.size)} className="tray-icon" alt="" />}

               {/* display selected temperature */}
              {tray.temp && <img src={getIcon(tray.temp)} className="tray-icon" alt="" />}

              {/* display selected milk (if exists) */}
              {tray.milk && tray.milk !== "" && <img src={getIcon(tray.milk)} className="tray-icon" alt="" />}

               {/* display selected flavor (if exists) */}
              {tray.flavor && tray.flavor !== "" && <img src={getIcon(tray.flavor)} className="tray-icon" alt="" />}

               {/* display all selected toppings */}
              {tray.toppings?.map((t, i) => (
                <img key={i} src={getIcon(t)} className="tray-icon" alt="" />
              ))}
            </>
          )}
        </div>
    </div>
  );
};

export default Tray;