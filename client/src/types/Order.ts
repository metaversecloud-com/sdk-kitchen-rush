export type Order = {
  id: string;
  size: string;
  temp: string;
  milk: string;
  flavor?: string;
  toppings?: string[];
  timeLimit: number;
};

export type Tray = Partial<Order>;

export const emptyTray = (): Tray => ({
  size: "",
  temp: "",
  milk: "",
  flavor: "",
  toppings: [],
});
