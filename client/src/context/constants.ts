import { InitialState } from "./types";

export const initialState: InitialState = {
  hasInteractiveParams: false,
  isAdmin: false,
  droppedAsset: undefined,
  badges: {},
  visitorInventory: { badges: {} },
  visitorStats: { gamesPlayed: 0, lifetimeCorrectOrders: 0 },
  error: "",
};
