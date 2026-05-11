import { PropsWithChildren, useReducer } from "react";
import { GlobalDispatchContext, GlobalStateContext } from "./GlobalContext";
import { initialState } from "./constants";
import { globalReducer } from "./reducer";

const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>{children}</GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export default GlobalProvider;
