import { Order } from "../types/Order"

export const compareIngredients = (currentOrder: Partial<Order>, activeOrder: Order) :  boolean => {
    if(currentOrder.size !== activeOrder.size || currentOrder.milk !== activeOrder.milk ||  
        currentOrder.temp !== activeOrder.temp || currentOrder.flavor !== activeOrder.flavor ) 
        return false;
    if (!currentOrder.toppings && !activeOrder.toppings) return true;
    if (!currentOrder.toppings || !activeOrder.toppings) return false;
    currentOrder.toppings.sort();
    activeOrder.toppings.sort();
    if (currentOrder.toppings.length !== activeOrder.toppings.length) return false;
    const toppings = currentOrder.toppings.every(topping => activeOrder.toppings?.includes(topping));
    if(toppings === false) return false;
        return true
}
