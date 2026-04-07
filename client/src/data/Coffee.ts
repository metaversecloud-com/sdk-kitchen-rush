import { Order } from "../types/Order";

export const LEVEL_ONE_ORDERS: Order[] = [
  { id: "1-1", size: "Small", temp: "Hot", milk: "Whole", timeLimit: 12000 },
  { id: "1-2", size: "Medium", temp: "Iced", milk: "Oat", timeLimit: 12000 },
  { id: "1-3", size: "Large", temp: "Hot", milk: "Almond", timeLimit: 12000 },
  { id: "1-4", size: "Small", temp: "Iced", milk: "Whole", timeLimit: 12000 },
  { id: "1-5", size: "Medium", temp: "Hot", milk: "None", timeLimit: 12000 },
  { id: "1-6", size: "Large", temp: "Iced", milk: "Oat", timeLimit: 12000 },
  { id: "1-7", size: "Small", temp: "Hot", milk: "Almond", timeLimit: 12000 },
  { id: "1-8", size: "Medium", temp: "Iced", milk: "None", timeLimit: 12000 },
  { id: "1-9", size: "Large", temp: "Hot", milk: "Whole", timeLimit: 12000 },
  { id: "1-10", size: "Small", temp: "Iced", milk: "Almond", timeLimit: 12000 },
];

export const LEVEL_TWO_ORDERS: Order[] = [
  { id: "2-1", size: "Small", temp: "Hot", milk: "Whole", flavor: "Vanilla", timeLimit: 10000 },
  { id: "2-2", size: "Medium", temp: "Iced", milk: "Oat", flavor: "Caramel", timeLimit: 10000 },
  { id: "2-3", size: "Large", temp: "Hot", milk: "Almond", flavor: "Mocha", timeLimit: 10000 },
  { id: "2-4", size: "Small", temp: "Iced", milk: "None", flavor: "None", timeLimit: 10000 },
  { id: "2-5", size: "Medium", temp: "Hot", milk: "Whole", flavor: "Caramel", timeLimit: 10000 },
  { id: "2-6", size: "Large", temp: "Iced", milk: "Oat", flavor: "Vanilla", timeLimit: 10000 },
  { id: "2-7", size: "Small", temp: "Hot", milk: "Almond", flavor: "None", timeLimit: 10000 },
  { id: "2-8", size: "Medium", temp: "Iced", milk: "Whole", flavor: "Mocha", timeLimit: 10000 },
  { id: "2-9", size: "Large", temp: "Hot", milk: "None", flavor: "Vanilla", timeLimit: 10000 },
  { id: "2-10", size: "Small", temp: "Iced", milk: "Oat", flavor: "Caramel", timeLimit: 10000 },
  { id: "2-11", size: "Medium", temp: "Hot", milk: "Almond", flavor: "Mocha", timeLimit: 10000 },
  { id: "2-12", size: "Large", temp: "Iced", milk: "Whole", flavor: "None", timeLimit: 10000 },
];

export const LEVEL_THREE_ORDERS: Order[] = [
  { id: "3-1", size: "Small", temp: "Hot", milk: "Whole", flavor: "Vanilla", toppings: ["Whipped Cream"], timeLimit: 9000 },
  { id: "3-2", size: "Medium", temp: "Iced", milk: "Oat", flavor: "Caramel", toppings: ["Cinnamon"], timeLimit: 9000 },
  { id: "3-3", size: "Large", temp: "Hot", milk: "Almond", flavor: "Mocha", toppings: ["Sprinkles"], timeLimit: 9000 },
  { id: "3-4", size: "Small", temp: "Iced", milk: "None", flavor: "None", toppings: [], timeLimit: 9000 },
  { id: "3-5", size: "Medium", temp: "Hot", milk: "Whole", flavor: "Caramel", toppings: ["Whipped Cream", "Cinnamon"], timeLimit: 9000 },
  { id: "3-6", size: "Large", temp: "Iced", milk: "Oat", flavor: "Vanilla", toppings: ["Sprinkles"], timeLimit: 9000 },
  { id: "3-7", size: "Small", temp: "Hot", milk: "Almond", flavor: "None", toppings: ["Whipped Cream"], timeLimit: 9000 },
  { id: "3-8", size: "Medium", temp: "Iced", milk: "Whole", flavor: "Mocha", toppings: ["Cinnamon", "Sprinkles"], timeLimit: 9000 },
  { id: "3-9", size: "Large", temp: "Hot", milk: "None", flavor: "Vanilla", toppings: ["Whipped Cream", "Sprinkles"], timeLimit: 9000 },
  { id: "3-10", size: "Small", temp: "Iced", milk: "Oat", flavor: "Caramel", toppings: [], timeLimit: 9000 },
  { id: "3-11", size: "Medium", temp: "Hot", milk: "Almond", flavor: "Mocha", toppings: ["Whipped Cream", "Cinnamon", "Sprinkles"], timeLimit: 9000 },
  { id: "3-12", size: "Large", temp: "Iced", milk: "Whole", flavor: "None", toppings: ["Cinnamon"], timeLimit: 9000 },
];

export const LEVEL_FOUR_ORDERS: Order[] = [
  { id: "4-1", size: "Small", temp: "Hot", milk: "Whole", flavor: "Vanilla", toppings: ["Whipped Cream", "Cinnamon"], timeLimit: 8000 },
  { id: "4-2", size: "Medium", temp: "Iced", milk: "Oat", flavor: "Caramel", toppings: ["Sprinkles", "Cinnamon"], timeLimit: 8000 },
  { id: "4-3", size: "Large", temp: "Hot", milk: "Almond", flavor: "Mocha", toppings: ["Whipped Cream", "Sprinkles"], timeLimit: 8000 },
  { id: "4-4", size: "Small", temp: "Iced", milk: "None", flavor: "None", toppings: ["Cinnamon"], timeLimit: 8000 },
  { id: "4-5", size: "Medium", temp: "Hot", milk: "Whole", flavor: "Caramel", toppings: ["Whipped Cream", "Cinnamon", "Sprinkles"], timeLimit: 8000 },
  { id: "4-6", size: "Large", temp: "Iced", milk: "Oat", flavor: "Vanilla", toppings: ["Sprinkles"], timeLimit: 8000 },
  { id: "4-7", size: "Small", temp: "Hot", milk: "Almond", flavor: "Mocha", toppings: ["Whipped Cream"], timeLimit: 8000 },
  { id: "4-8", size: "Medium", temp: "Iced", milk: "Whole", flavor: "None", toppings: ["Cinnamon", "Sprinkles"], timeLimit: 8000 },
  { id: "4-9", size: "Large", temp: "Hot", milk: "None", flavor: "Vanilla", toppings: ["Whipped Cream", "Cinnamon"], timeLimit: 8000 },
  { id: "4-10", size: "Small", temp: "Iced", milk: "Oat", flavor: "Caramel", toppings: ["Sprinkles", "Whipped Cream"], timeLimit: 8000 },
  { id: "4-11", size: "Medium", temp: "Hot", milk: "Almond", flavor: "Mocha", toppings: ["Whipped Cream", "Cinnamon", "Sprinkles"], timeLimit: 8000 },
  { id: "4-12", size: "Large", temp: "Iced", milk: "Whole", flavor: "Vanilla", toppings: ["Cinnamon"], timeLimit: 8000 },
  { id: "4-13", size: "Small", temp: "Hot", milk: "Oat", flavor: "None", toppings: ["Whipped Cream", "Sprinkles"], timeLimit: 8000 },
  { id: "4-14", size: "Medium", temp: "Iced", milk: "None", flavor: "Caramel", toppings: ["Cinnamon", "Whipped Cream"], timeLimit: 8000 },
];