import { ActorRef, EventFrom, SnapshotFrom, fromPromise } from "xstate";
import { tokenMachine } from "./tokenMachine";
import React, { createContext } from "react";
import { useLcdClient } from "@terra-money/wallet-kit";
import { TokenInfo, TokenMarketingInfo } from "@/interface";
import { nativeCoin, trustedTokens } from "@/constant/network";
import { useActorRef } from "@xstate/react";

type EventType = EventFrom<typeof tokenMachine>;
type SnapshotType = SnapshotFrom<typeof tokenMachine>;

export const TokenMachineContext = createContext<{
  tokenActor: ActorRef<SnapshotType, EventType>;
}>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenActor: undefined as any,
});

const CHAIN_ID = "pisco-1";

export function TokenMachineProvider(props: { children: React.ReactNode }) {
  const lcd = useLcdClient();

  const fetchTokenList = async () => {
    const trustedTokenList = trustedTokens[CHAIN_ID] ?? [];
    const promises = trustedTokenList.map(tokenAddr => {
      return Promise.all([
        lcd.wasm.contractQuery<TokenInfo>(tokenAddr, { token_info: {} }),
        lcd.wasm.contractQuery<TokenMarketingInfo>(tokenAddr, {
          marketing_info: {},
        }),
      ] as const);
    });
    const resolvedTokenList = await Promise.all(promises);
    const tokenMetaList = resolvedTokenList.map(
      ([tokenInfo, marketingInfo], idx) => {
        return {
          info: tokenInfo,
          marketing: marketingInfo,
          address: trustedTokenList[idx],
        };
      },
    );
    return [nativeCoin[CHAIN_ID]].concat(tokenMetaList);
  };

  const actorRef = useActorRef(
    tokenMachine.provide({
      actors: {
        loadList: fromPromise(() => fetchTokenList()),
      },
    }),
  );

  return (
    <TokenMachineContext.Provider value={{ tokenActor: actorRef }}>
      {props.children}
    </TokenMachineContext.Provider>
  );
}
