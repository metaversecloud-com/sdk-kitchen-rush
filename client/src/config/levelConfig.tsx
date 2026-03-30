export const levelConfig = {
  1: {
    title: "Warm-Up",
    description: "Pick the size, temperature, and milk for each drink!",
    ingredients: {
      size:    ["small", "medium", "large"],
      temp:    ["hot", "iced"],
      milk:    ["whole", "oat", "almond", "none"],
      flavor:  [],
      topping: []
    },
  },
  2: {
    title: "Lunch Rush",
    description: "Now customers want flavor shots too! Pick vanilla, caramel, or mocha.",
    ingredients: {
      size:    ["small", "medium", "large"],
      temp:    ["hot", "iced"],
      milk:    ["whole", "oat", "almond", "none"],
      flavor:  ["vanilla", "caramel", "mocha", "none"],
      topping: []
    },
  },
  3: {
    title: "Dinner Rush",
    description: "Getting fancy! Add toppings on top of your drink order.",
    ingredients: {
      size:    ["small", "medium", "large"],
      temp:    ["hot", "iced"],
      milk:    ["whole", "oat", "almond", "none"],
      flavor:  ["vanilla", "caramel", "mocha", "none"],
      topping: ["whipped_cream", "cinnamon", "sprinkles"]
    },
  },
  4: {
    title: "Chef's Challenge",
    description: "You're a pro! More toppings, more choices. Can you handle the rush?",
    ingredients: {
      size:    ["small", "medium", "large"],
      temp:    ["hot", "iced"],
      milk:    ["whole", "oat", "almond", "none"],
      flavor:  ["vanilla", "caramel", "mocha", "none"],
      topping: ["whipped_cream", "cinnamon", "sprinkles", "java_chips", "caramel_drizzle", "choc_drizzle"]
    },
  },
} as const;