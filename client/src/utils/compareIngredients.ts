import { Order } from "../types/Order"

export const compareIngredients = (currentOrder: Partial<Order>, activeOrder: Order | null): boolean => {
    if (!activeOrder) return false;

    // Helper to safely compare strings and treat "none", null, and undefined as the same
    const isMatch = (val1: any, val2: any) => {
        const v1 = String(val1 || "").trim().toLowerCase();
        const v2 = String(val2 || "").trim().toLowerCase();
        
        // Check for "none" regardless of case
        const isV1None = v1 === "" || v1 === "none";
        const isV2None = v2 === "" || v2 === "none";

        if (isV1None && isV2None) {
            return true;
        }
        
        return v1 === v2;
    };
    // 1. Check main ingredients
    const baseMatch = 
        isMatch(currentOrder.size, activeOrder.size) &&
        isMatch(currentOrder.milk, activeOrder.milk) &&
        isMatch(currentOrder.temp, activeOrder.temp);

    if (!baseMatch) return false;

    // 2. Flavor Match (Handles Level 1 vs Level 2+)
    if (!isMatch(currentOrder.flavor, activeOrder.flavor)) {
        return false;
    }

    // 3. Toppings logic (Handles Level 3+)
    const trayToppings = currentOrder.toppings || [];
    const orderToppings = activeOrder.toppings || [];

    // If lengths don't match, it's wrong
    if (trayToppings.length !== orderToppings.length) return false;

    // Check if every topping on the tray is in the order
    return trayToppings.every(t => 
        orderToppings.some(ot => ot.toLowerCase().trim() === t.toLowerCase().trim())
    );
};