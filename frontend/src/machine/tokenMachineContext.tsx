import { ActorRef, EventFrom, SnapshotFrom, fromPromise } from "xstate";
import { tokenMachine } from "./tokenMachine";
import React, { createContext } from "react";
import { useLcdClient } from "@terra-money/wallet-kit";
import { TokenInfo, TokenMarketingInfo, TokenMeta } from "@/interface";
import { nativeCoin, trustedTokens } from "@/constant/network";
import { useActorRef } from "@xstate/react";
import { getConfig } from "@/lib/config";

type EventType = EventFrom<typeof tokenMachine>;
type SnapshotType = SnapshotFrom<typeof tokenMachine>;

export const TokenMachineContext = createContext<{
  tokenActor: ActorRef<SnapshotType, EventType>;
}>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenActor: undefined as any,
});

const { chainId } = getConfig();

export function TokenMachineProvider(props: { children: React.ReactNode }) {
  const lcd = useLcdClient();

  const searchToken = async (value: {
    address: string;
    tokenList: TokenMeta[];
  }) => {
    try {
      const found = value.tokenList.find(
        item => item.address === value.address,
      );
      if (found) return undefined;
      const [info, marketingInfo] = await Promise.all([
        lcd.wasm.contractQuery<TokenInfo>(value.address, { token_info: {} }),
        lcd.wasm.contractQuery<TokenMarketingInfo>(value.address, {
          marketing_info: {},
        }),
      ] as const);
      return {
        isNative: false,
        info: info,
        marketing: marketingInfo,
        address: value.address,
      } as TokenMeta;
    } catch (error) {
      return undefined;
    }
  };

  const fetchTokenList = async () => {
    const trustedTokenList = trustedTokens[chainId as "pisco-1"] ?? [];
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
    return [nativeCoin[chainId]].concat(tokenMetaList);
  };

  const actorRef = useActorRef(
    tokenMachine.provide({
      actors: {
        loadList: fromPromise(() => fetchTokenList()),
        searchToken: fromPromise(({ input }) => searchToken(input)),
      },
    }),
  );

  return (
    <TokenMachineContext.Provider value={{ tokenActor: actorRef }}>
      {props.children}
    </TokenMachineContext.Provider>
  );
}
