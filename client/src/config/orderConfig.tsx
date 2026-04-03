import { levelConfig } from "./levelConfig";

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateOrder(level: keyof typeof levelConfig) {
  const ing = levelConfig[level].ingredients;

  return {
    size: rand(ing.size),
    temp: rand(ing.temp),
    milk: rand(ing.milk),
    flavor: ing.flavor.length > 0 ? rand(ing.flavor) : null,
    toppings: ing.topping.length > 0 ? [rand(ing.topping)] : [],
  };
}

export function getLevelOrders(level: number) {
  const levelKey = `level${level}` as keyof typeof levelConfig;

  return Array.from({ length: 5 }, () =>
    generateOrder(levelKey)
  );
}