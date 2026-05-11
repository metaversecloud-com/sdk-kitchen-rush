import { Tray as TrayState } from "@/types/Order";

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
  "no-milk": noMilkImg,
  "no-flavor": noMilkImg,
};

const getIcon = (value: string | undefined): string | null => (value ? ICONS[value.toLowerCase()] || null : null);

export const Tray = ({ tray }: { tray: TrayState }) => {
  const items = [tray.size, tray.temp, tray.milk, tray.flavor, ...(tray.toppings || [])].filter(
    (v): v is string => !!v && v !== "",
  );

  return (
    <div className="card">
      <h6>Your Tray</h6>
      <div className="grid grid-cols-3 gap-2 justify-center items-center">
        {items.length === 0 ? (
          <span className="p2 text-muted">empty</span>
        ) : (
          items.map((value, index) => {
            const src = getIcon(value);
            return src ? <img key={`${value}-${index}`} src={src} className="tray-icon" alt={value} /> : null;
          })
        )}
      </div>
    </div>
  );
};

export default Tray;
