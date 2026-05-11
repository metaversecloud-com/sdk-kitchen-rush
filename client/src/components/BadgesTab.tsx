import { useContext } from "react";

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
      {Object.values(badges).map((badge) => {
        const { name, description, icon } = badge;
        const hasBadge = visitorInventory?.badges && name in visitorInventory.badges;
        const filterStyle = !hasBadge ? { filter: "grayscale(1)", opacity: 0.5 } : {};

        return (
          <div className="tooltip text-center" key={name}>
            <span className="tooltip-content p3" style={{ width: "120px" }}>
              {description || name}
            </span>
            {icon ? (
              <img src={icon} alt={name} style={{ ...filterStyle, margin: "0 auto", maxWidth: "100%" }} />
            ) : (
              <div
                style={{
                  ...filterStyle,
                  margin: "0 auto",
                  borderRadius: "50%",
                  background: "#dfe6e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="p3">?</span>
              </div>
            )}
            <p className="p3 mt-1">{name}</p>
          </div>
        );
      })}
    </div>
  );
};

export default BadgesTab;
