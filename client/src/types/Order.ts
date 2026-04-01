export type Order = {
  id: string;
  size: "Small" | "Medium" | "Large";
  temp: "Hot" | "Iced";
  milk: "Whole" | "Oat" | "Almond" | "None";
  flavor?: "Vanilla" | "Caramel" | "Mocha" | "None";
  toppings?: string[];
  timeLimit: number;
};
