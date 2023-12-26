import { PairWithKey, TokenMeta } from "@/interface";
import { createContext } from "react";
import { proxy, subscribe } from "valtio";

const isDevelopment = process.env.NODE_ENV === "development";
const PAIR_LIST_STORAGE_KEY = "APP_CONTEXT_PAIR_LIST";
const TOKEN_LIST_STORAGE_KEY = "APP_CONTEXT_TOKEN_LIST";

const loadPersistedPairList = (() => {
  try {
    if (isDevelopment) return [];
    return JSON.parse(localStorage.getItem(PAIR_LIST_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
})();

const persistPairList = (data: PairWithKey[]) => {
  try {
    localStorage.setItem(PAIR_LIST_STORAGE_KEY, JSON.stringify(data, null, 2));
  } catch (error) {
    // todo: handle error
  }
};

const loadPersistedTokenList = (() => {
  try {
    if (isDevelopment) return [];
    return JSON.parse(localStorage.getItem(TOKEN_LIST_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
})();

const persistTokenList = (data: TokenMeta[]) => {
  try {
    localStorage.setItem(TOKEN_LIST_STORAGE_KEY, JSON.stringify(data, null, 2));
  } catch (error) {
    // todo: handle error
  }
};

const factoryState = proxy({
  pairList: loadPersistedPairList as PairWithKey[],
  tokenList: loadPersistedTokenList as TokenMeta[],
  loadingPairList: false as boolean,
  loadingTokenList: false as boolean,
  initialized: false as boolean,
});

subscribe(factoryState, () => {
  if (isDevelopment) return;
  persistPairList(factoryState.pairList);
  persistTokenList(factoryState.tokenList);
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
