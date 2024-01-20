import { useLcdClient } from "@terra-money/wallet-kit";
import React, { createContext } from "react";
import { ActorRef, EventFrom, SnapshotFrom, fromPromise } from "xstate";
import { liquidityMachine } from ".";
import { useActorRef } from "@xstate/react";
import {
  Pair,
  TokenInfo,
  TokenInfoList,
  TokenMarketingInfo,
} from "@/interface";
import { factoryContractAddress } from "@/constant/network";

type EventType = EventFrom<typeof liquidityMachine>;
type SnapshotType = SnapshotFrom<typeof liquidityMachine>;

const CHAIN_ID = "pisco-1";
const FACTORY_CONTRACT_ADDR = factoryContractAddress[CHAIN_ID];

export const LiquidityMachineContext = createContext<{
  liquidityActor: ActorRef<SnapshotType, EventType>;
}>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  liquidityActor: undefined as any,
});

export function LiquidityMachineProvider(props: { children: React.ReactNode }) {
  const lcd = useLcdClient();

  const refetchPairList = async (currentPairList: Pair[]) => {
    const pairList = await lcd.wasm.contractQuery<Pair[]>(
      FACTORY_CONTRACT_ADDR,
      {
        pair_list: currentPairList.length
          ? {
              after: {
                token1: currentPairList[currentPairList.length - 1].assets[0],
                token2: currentPairList[currentPairList.length - 1].assets[1],
              },
            }
          : {},
      },
    );

    return {
      isAllPairsFetched: pairList.length === 0,
      pairList: [...currentPairList, ...pairList],
    };
  };

  const loadTokenInfo = async (pairList: Pair[]) => {
    const tmpTokens = new Set<string>();

    pairList.map(pair => {
      pair.assets.map(v => {
        if (v["cw20"]) tmpTokens.add(v["cw20"]);
      });
    });

    const contractTokens = [...tmpTokens];

    const dataTokenMarketInfo = await Promise.all(
      contractTokens.map(tokenAddr =>
        lcd.wasm.contractQuery<TokenMarketingInfo>(tokenAddr, {
          marketing_info: {},
        }),
      ),
    );

    const dataTokenInfo = await Promise.all(
      contractTokens.map(tokenAddr =>
        lcd.wasm.contractQuery<TokenInfo>(tokenAddr, { token_info: {} }),
      ),
    );

    let tokensInfo: TokenInfoList = {};

    dataTokenMarketInfo.map((info, i) => {
      tokensInfo = {
        ...tokensInfo,
        [contractTokens[i]]: { ...info, ...dataTokenInfo[i] },
      };
    });

    return tokensInfo;
  };

  const loadPairList = async () => {
    const pairList = await lcd.wasm.contractQuery<Pair[]>(
      FACTORY_CONTRACT_ADDR,
      {
        pair_list: {},
      },
    );

    return {
      isAllPairsFetched: pairList.length === 0,
      pairList,
    };
  };

  const actorRef = useActorRef(
    liquidityMachine.provide({
      actors: {
        loadPairList: fromPromise(() => loadPairList()),
        refetchPairList: fromPromise(({ input }) => refetchPairList(input)),
        loadTokenInfo: fromPromise(({ input }) => loadTokenInfo(input)),
      },
    }),
  );

  return (
    <LiquidityMachineContext.Provider value={{ liquidityActor: actorRef }}>
      {props.children}
    </LiquidityMachineContext.Provider>
  );
}
