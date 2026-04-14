import { Order } from "../types/Order";
// Check this line! It MUST include all the levels inside the { }
import { 
  LEVEL_ONE_ORDERS, 
  LEVEL_TWO_ORDERS, 
  LEVEL_THREE_ORDERS, 
  LEVEL_FOUR_ORDERS 
} from "../data/Coffee";

export const levelOrders: Record<number, Order[]> = {
  1: LEVEL_ONE_ORDERS,
  2: LEVEL_TWO_ORDERS,  
  3: LEVEL_THREE_ORDERS, 
  4: LEVEL_FOUR_ORDERS,
};