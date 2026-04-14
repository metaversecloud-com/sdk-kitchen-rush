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
    whipped_cream: whippedImg, // Matches the data ID
    none: noMilkImg,
    "no-milk": noMilkImg,
    "no-flavor": noMilkImg,
  };

  // Helper to get icon regardless of CAPS
  const getIcon = (val: string | undefined) => {
    if (!val) return null;
    return iconMap[val.toLowerCase()] || null;
  };

  const isEmpty = !tray.size && !tray.temp && !tray.milk && !tray.flavor;

  return (
    <div className="tray-container">
      <div className="order-header"><h3>Your Tray</h3></div>
        <div className="order-visual">
          {isEmpty ? (
            <span className="empty-label">empty</span>
          ) : (
            <>
              {tray.size && <img src={getIcon(tray.size)} className="tray-icon" alt="" />}
              {tray.temp && <img src={getIcon(tray.temp)} className="tray-icon" alt="" />}
              {tray.milk && tray.milk !== "" && <img src={getIcon(tray.milk)} className="tray-icon" alt="" />}
              {tray.flavor && tray.flavor !== "" && <img src={getIcon(tray.flavor)} className="tray-icon" alt="" />}
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