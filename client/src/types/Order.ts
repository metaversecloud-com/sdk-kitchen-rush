export type Order = {
  id: string;
  size: "Small" | "Medium" | "Large";
  temp: "Hot" | "Iced";
  milk: "Whole" | "Oat" | "Almond" | "No";
  flavor?: "Vanilla" | "Caramel" | "Mocha" | "No";
  toppings?: string[];
  timeLimit: number;
};
