// src/config/levelConfig.ts

export const levelConfig = {
  1: {
    title: "Warm-Up",
    threshold: 5, // Levels up after 5 successful orders
    timer: 12000, // 12 seconds
    description: "Pick the size, temperature, and milk for each drink! Get into the rhythm of the kitchen.",
    instructions: [
      "2–3 ingredients per order",
      "Timer: 12 seconds per customer",
      "Focus on Size, Temp, and Milk"
    ],
    ingredients: {
      size: ["small", "medium", "large"],
      temp: ["hot", "iced"],
      milk: ["whole", "oat", "almond", "none"],
      flavor: [],
      toppings: []
    },
  },
  2: {
    title: "Lunch Rush",
    threshold: 6, // Levels up after 12 total successful orders
    timer: 10000, // 10 seconds
    description: "The midday crowd is here! Now customers want flavor shots too.",
    instructions: [
      "3–4 ingredients per order",
      "Timer: 10 seconds per customer",
      "New Ingredients: Vanilla, Caramel, and Mocha flavors!"
    ],
    ingredients: {
      size: ["small", "medium", "large"],
      temp: ["hot", "iced"],
      milk: ["whole", "oat", "almond", "none"],
      flavor: ["vanilla", "caramel", "mocha", "none"],
      toppings: [] 
    },
  },
  3: {
    title: "Dinner Rush",
    threshold: 7, // Levels up after 20 total successful orders
    timer: 8000, // 8 seconds
    description: "Getting fancy! Customers are looking for treats. Add toppings to your drink orders.",
    instructions: [
      "4–5 ingredients per order",
      "Timer: 8 seconds per customer",
      "New Ingredients: Whipped Cream, Cinnamon, and Sprinkles!"
    ],
    ingredients: {
      size: ["small", "medium", "large"],
      temp: ["hot", "iced"],
      milk: ["whole", "oat", "almond", "none"],
      flavor: ["vanilla", "caramel", "mocha", "none"],
      toppings: ["whipped_cream", "cinnamon", "sprinkles"]
    },
  },
  4: {
    title: "Chef's Challenge",
    threshold: 999, // Essentially endless or until they fail
    timer: 5000, // 4 seconds
    description: "You're a pro! Maximum complexity and maximum speed. Can you handle the rush?",
    instructions: [
      "5+ ingredients per order",
      "Timer: 7 seconds per customer",
      "Ultimate Challenge: Java Chips and Drizzles unlocked!"
    ],
    ingredients: {
      size: ["small", "medium", "large"],
      temp: ["hot", "iced"],
      milk: ["whole", "oat", "almond", "none"],
      flavor: ["vanilla", "caramel", "mocha", "none"],
      toppings: ["whipped_cream", "cinnamon", "sprinkles", "java_chips", "caramel_drizzle", "choc_drizzle"]
    },
  },
} as const;