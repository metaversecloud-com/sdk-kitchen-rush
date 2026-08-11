import { useContext } from "react";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

export const BadgesTab = () => {
  const { badges, visitorInventory } = useContext(GlobalStateContext);

  if (!badges || Object.keys(badges).length === 0) {
    return (
      <div className="text-center py-6">
        <p className="p2">No badges available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3">
      {badges &&
        Object.values(badges).map((badge) => {
          const { name, description, icon } = badge;
          const hasBadge = visitorInventory?.badges && Object.keys(visitorInventory.badges).includes(name);
          const style = { maxWidth: "100%", filter: "none" };
          if (!hasBadge) style.filter = "grayscale(1)";
          return (
            <div className="tooltip" key={name}>
              <span className="tooltip-content" style={{ width: "115px" }}>
                {description ? description : name}
              </span>
              <img src={icon} alt={name} style={style} />
              <p className="p3 pb-2">{name}</p>
            </div>
          );
        })}
    </div>
  );
};

export default BadgesTab;
