import { Order } from "../types/Order"

export const LEVEL_ONE_ORDERS: Order[] = [
    { id: "1", size: "Small", temp: "Hot", milk: "Whole", timeLimit: 12000 },
    { id: "2", size: "Medium", temp: "Iced", milk: "Oat", timeLimit: 12000 },
    { id: "3", size: "Large", temp: "Hot", milk: "Almond", timeLimit: 12000 },
    { id: "4", size: "Small", temp: "Iced", milk: "Whole", timeLimit: 12000 },
    { id: "5", size: "Medium", temp: "Hot", milk: "None", timeLimit: 12000 },
    { id: "6", size: "Large", temp: "Iced", milk: "Oat", timeLimit: 12000 },
    { id: "7", size: "Small", temp: "Hot", milk: "Almond", timeLimit: 12000 },
    { id: "8", size: "Medium", temp: "Iced", milk: "None", timeLimit: 12000 },
    { id: "9", size: "Large", temp: "Hot", milk: "Whole", timeLimit: 12000 },
    { id: "10", size: "Small", temp: "Iced", milk: "Almond", timeLimit: 12000 },
]

// Level 2: Adds Flavor Shots
export const LEVEL_TWO_ORDERS: Order[] = [
    { id: "2-1", size: "Small", temp: "Hot", milk: "Whole", flavor: "vanilla", timeLimit: 10000 },
    { id: "2-2", size: "Large", temp: "Iced", milk: "Oat", flavor: "caramel", timeLimit: 10000 },
    { id: "2-3", size: "Medium", temp: "Hot", milk: "None", flavor: "mocha", timeLimit: 10000 },
];

// Level 3: Adds Toppings
export const LEVEL_THREE_ORDERS: Order[] = [
    { id: "3-1", size: "Large", temp: "Hot", milk: "Almond", flavor: "vanilla", toppings: ["whipped_cream"], timeLimit: 8000 },
    { id: "3-2", size: "Medium", temp: "Iced", milk: "Whole", flavor: "mocha", toppings: ["sprinkles", "cinnamon"], timeLimit: 8000 },
];

// Level 4: Even more toppings!
export const LEVEL_FOUR_ORDERS: Order[] = [
    { 
      id: "4-1", size: "Large", temp: "Iced", milk: "Oat", flavor: "caramel", 
      toppings: ["whipped_cream", "java_chips", "caramel_drizzle"], 
      timeLimit: 7000 
    },
];