import { InitialState } from "./types";

export const initialState: InitialState = {
  hasInteractiveParams: false,
  isAdmin: false,
  droppedAsset: undefined,
  badges: {},
  visitorInventory: { badges: {} },
  error: "",
};
