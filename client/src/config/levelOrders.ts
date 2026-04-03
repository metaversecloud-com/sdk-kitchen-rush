import { Order } from "../types/Order";
import { LEVEL_ONE_ORDERS } from "../data/Coffee";

// Add LEVEL_TWO_ORDERS, LEVEL_THREE_ORDERS, LEVEL_FOUR_ORDERS to Coffee.ts as you build them
// For now levels 2-4 reuse level 1 orders as placeholders

export const levelOrders: Record<number, Order[]> = {
  1: LEVEL_ONE_ORDERS,
  2: LEVEL_ONE_ORDERS, // replace with LEVEL_TWO_ORDERS
  3: LEVEL_ONE_ORDERS, // replace with LEVEL_THREE_ORDERS
  4: LEVEL_ONE_ORDERS, // replace with LEVEL_FOUR_ORDERS
};