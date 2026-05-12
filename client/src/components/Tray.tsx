import { getIngredientIcon } from "@/data/ingredientIcons";
import { Tray as TrayState } from "@/types/Order";

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
            const src = getIngredientIcon(value);
            return src ? <img key={`${value}-${index}`} src={src} className="tray-icon" alt={value} /> : null;
          })
        )}
      </div>
    </div>
  );
};

export default Tray;
