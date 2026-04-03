import { Order } from "../types/Order"

export const compareIngredients = (currentOrder: Partial<Order>, activeOrder: Order): boolean => {
    // Helper to safely compare strings regardless of Capitalization or Spaces
    const isMatch = (val1: any, val2: any) => {
        return String(val1 || "").trim().toLowerCase() === String(val2 || "").trim().toLowerCase();
    };

    // Check main ingredients
    if (!isMatch(currentOrder.size, activeOrder.size) || 
        !isMatch(currentOrder.milk, activeOrder.milk) || 
        !isMatch(currentOrder.temp, activeOrder.temp) || 
        !isMatch(currentOrder.flavor, activeOrder.flavor)) {
        return false;
    }

    // Toppings logic
    const trayToppings = currentOrder.toppings || [];
    const orderToppings = activeOrder.toppings || [];

    if (trayToppings.length !== orderToppings.length) return false;

    // Compare each topping (lowercased)
    return trayToppings.every(t => 
        orderToppings.some(ot => ot.toLowerCase().trim() === t.toLowerCase().trim())
    );
};