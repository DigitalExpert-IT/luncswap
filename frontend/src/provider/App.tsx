import { Pair } from "@/interface";
import { createContext } from "react";
import { proxy } from "valtio";

const factoryState = proxy({
  pairList: [] as Pair[],
  loadingPairList: false as boolean,
});

type AppContextType = {
  factory: typeof factoryState;
};

export const AppContext = createContext<AppContextType>({
  factory: factoryState,
});

export const AppProvider = (props: { children: React.ReactNode }) => {
  return (
    <AppContext.Provider value={{ factory: factoryState }}>
      {props.children}
    </AppContext.Provider>
  );
};
