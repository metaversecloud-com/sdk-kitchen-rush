import { levelConfig } from "./levelConfig";
import { Order } from "../types/Order";

export const generateOrder = (level: number): Order => {
  // Use type assertion to ensure TypeScript knows 'level' is a valid key
  const config = levelConfig[level as keyof typeof levelConfig];

  // This is where your error was: config was undefined!
  if (!config) {
    throw new Error(`Level ${level} not found in levelConfig`);
  }

  const { ingredients } = config;

  return {
    id: Math.random().toString(36).substr(2, 9),
    size: ingredients.size[Math.floor(Math.random() * ingredients.size.length)],
    temp: ingredients.temp[Math.floor(Math.random() * ingredients.temp.length)],
    milk: ingredients.milk[Math.floor(Math.random() * ingredients.milk.length)],
    // Only add flavor/toppings if they exist for this level
    flavor: ingredients.flavor.length > 0 
      ? ingredients.flavor[Math.floor(Math.random() * ingredients.flavor.length)] 
      : undefined,
    toppings: ingredients.toppings.length > 0 
      ? [ingredients.toppings[Math.floor(Math.random() * ingredients.toppings.length)]] 
      : [],
    timeLimit: 12000, // 12 seconds default
  };
};

export const getLevelOrders = (level: number, count: number = 10): Order[] => {
  return Array.from({ length: count }, () => generateOrder(level));
};