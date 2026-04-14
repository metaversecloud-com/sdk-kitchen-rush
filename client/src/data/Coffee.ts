import { Order } from "../types/Order";

export const LEVEL_ONE_ORDERS: Order[] = [
  { id: "1-1", size: "small", temp: "hot", milk: "whole", timeLimit: 12000 },
  { id: "1-2", size: "medium", temp: "iced", milk: "oat", timeLimit: 12000 },
  { id: "1-3", size: "large", temp: "hot", milk: "almond", timeLimit: 12000 },
  { id: "1-4", size: "small", temp: "iced", milk: "whole", timeLimit: 12000 },
  { id: "1-5", size: "medium", temp: "hot", milk: "none", timeLimit: 12000 },
  { id: "1-6", size: "large", temp: "iced", milk: "oat", timeLimit: 12000 },
  { id: "1-7", size: "small", temp: "hot", milk: "almond", timeLimit: 12000 },
  { id: "1-8", size: "medium", temp: "iced", milk: "none", timeLimit: 12000 },
  { id: "1-9", size: "large", temp: "hot", milk: "whole", timeLimit: 12000 },
  { id: "1-10", size: "small", temp: "iced", milk: "almond", timeLimit: 12000 },
];

export const LEVEL_TWO_ORDERS: Order[] = [
  { id: "2-1", size: "small", temp: "hot", milk: "whole", flavor: "vanilla", timeLimit: 10000 },
  { id: "2-2", size: "medium", temp: "iced", milk: "oat", flavor: "caramel", timeLimit: 10000 },
  { id: "2-3", size: "large", temp: "hot", milk: "almond", flavor: "mocha", timeLimit: 10000 },
  { id: "2-4", size: "small", temp: "iced", milk: "none", flavor: "none", timeLimit: 10000 },
  { id: "2-5", size: "medium", temp: "hot", milk: "whole", flavor: "caramel", timeLimit: 10000 },
  { id: "2-6", size: "large", temp: "iced", milk: "oat", flavor: "vanilla", timeLimit: 10000 },
  { id: "2-7", size: "small", temp: "hot", milk: "almond", flavor: "none", timeLimit: 10000 },
  { id: "2-8", size: "medium", temp: "iced", milk: "whole", flavor: "mocha", timeLimit: 10000 },
  { id: "2-9", size: "large", temp: "hot", milk: "none", flavor: "vanilla", timeLimit: 10000 },
  { id: "2-10", size: "small", temp: "iced", milk: "oat", flavor: "caramel", timeLimit: 10000 },
  { id: "2-11", size: "medium", temp: "hot", milk: "almond", flavor: "mocha", timeLimit: 10000 },
  { id: "2-12", size: "large", temp: "iced", milk: "whole", flavor: "none", timeLimit: 10000 },
];

export const LEVEL_THREE_ORDERS: Order[] = [
  { id: "3-1", size: "small", temp: "hot", milk: "whole", flavor: "vanilla", toppings: ["whipped"], timeLimit: 9000 },
  { id: "3-2", size: "medium", temp: "iced", milk: "oat", flavor: "caramel", toppings: ["cinnamon"], timeLimit: 9000 },
  { id: "3-3", size: "large", temp: "hot", milk: "almond", flavor: "mocha", toppings: ["sprinkles"], timeLimit: 9000 },
  { id: "3-4", size: "small", temp: "iced", milk: "none", flavor: "none", toppings: [], timeLimit: 9000 },
  { id: "3-5", size: "medium", temp: "hot", milk: "whole", flavor: "caramel", toppings: ["whipped", "cinnamon"], timeLimit: 9000 },
  { id: "3-6", size: "large", temp: "iced", milk: "oat", flavor: "vanilla", toppings: ["sprinkles"], timeLimit: 9000 },
  { id: "3-7", size: "small", temp: "hot", milk: "almond", flavor: "none", toppings: ["whipped"], timeLimit: 9000 },
  { id: "3-8", size: "medium", temp: "iced", milk: "whole", flavor: "mocha", toppings: ["cinnamon", "sprinkles"], timeLimit: 9000 },
  { id: "3-9", size: "large", temp: "hot", milk: "none", flavor: "vanilla", toppings: ["whipped", "sprinkles"], timeLimit: 9000 },
  { id: "3-10", size: "small", temp: "iced", milk: "oat", flavor: "caramel", toppings: [], timeLimit: 9000 },
  { id: "3-11", size: "medium", temp: "hot", milk: "almond", flavor: "mocha", toppings: ["whipped", "cinnamon", "sprinkles"], timeLimit: 9000 },
  { id: "3-12", size: "large", temp: "iced", milk: "whole", flavor: "none", toppings: ["cinnamon"], timeLimit: 9000 },
];

export const LEVEL_FOUR_ORDERS: Order[] = [
  { id: "4-1", size: "small", temp: "hot", milk: "whole", flavor: "vanilla", toppings: ["whipped", "cinnamon"], timeLimit: 8000 },
  { id: "4-2", size: "medium", temp: "iced", milk: "oat", flavor: "caramel", toppings: ["sprinkles", "cinnamon"], timeLimit: 8000 },
  { id: "4-3", size: "large", temp: "hot", milk: "almond", flavor: "mocha", toppings: ["whipped", "sprinkles"], timeLimit: 8000 },
  { id: "4-4", size: "small", temp: "iced", milk: "none", flavor: "none", toppings: ["cinnamon"], timeLimit: 8000 },
  { id: "4-5", size: "medium", temp: "hot", milk: "whole", flavor: "caramel", toppings: ["whipped", "cinnamon", "sprinkles"], timeLimit: 8000 },
  { id: "4-6", size: "large", temp: "iced", milk: "oat", flavor: "vanilla", toppings: ["sprinkles"], timeLimit: 8000 },
  { id: "4-7", size: "small", temp: "hot", milk: "almond", flavor: "mocha", toppings: ["whipped"], timeLimit: 8000 },
  { id: "4-8", size: "medium", temp: "iced", milk: "whole", flavor: "none", toppings: ["cinnamon", "sprinkles"], timeLimit: 8000 },
  { id: "4-9", size: "large", temp: "hot", milk: "none", flavor: "vanilla", toppings: ["whipped", "cinnamon"], timeLimit: 8000 },
  { id: "4-10", size: "small", temp: "iced", milk: "oat", flavor: "caramel", toppings: ["sprinkles", "whipped"], timeLimit: 8000 },
  { id: "4-11", size: "medium", temp: "hot", milk: "almond", flavor: "mocha", toppings: ["whipped", "cinnamon", "sprinkles"], timeLimit: 8000 },
  { id: "4-12", size: "large", temp: "iced", milk: "whole", flavor: "vanilla", toppings: ["cinnamon"], timeLimit: 8000 },
  { id: "4-13", size: "small", temp: "hot", milk: "oat", flavor: "none", toppings: ["whipped", "sprinkles"], timeLimit: 8000 },
  { id: "4-14", size: "medium", temp: "iced", milk: "none", flavor: "caramel", toppings: ["cinnamon", "whipped"], timeLimit: 8000 },
];