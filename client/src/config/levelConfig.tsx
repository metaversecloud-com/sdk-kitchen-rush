export const levelConfig = {
  1: {
    title: "Warm-Up",
    description: "Pick the size, temperature, and milk for each drink!",
    ingredients: {
      size: ["small", "medium", "large"],
      temp: ["hot", "iced"],
      milk: ["whole", "oat", "almond", "none"],
      flavor: [],
      toppings: [] // Unified plural
    },
  },
  2: {
    title: "Lunch Rush",
    description: "Now customers want flavor shots too!",
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
    description: "Getting fancy! Add toppings on top of your drink order.",
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
    description: "You're a pro! More choices. Can you handle the rush?",
    ingredients: {
      size: ["small", "medium", "large"],
      temp: ["hot", "iced"],
      milk: ["whole", "oat", "almond", "none"],
      flavor: ["vanilla", "caramel", "mocha", "none"],
      toppings: ["whipped_cream", "cinnamon", "sprinkles", "java_chips", "caramel_drizzle", "choc_drizzle"]
    },
  },
} as const;