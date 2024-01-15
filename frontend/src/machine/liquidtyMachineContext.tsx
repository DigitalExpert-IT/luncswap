import { useLcdClient } from "@terra-money/wallet-kit";
import React, { createContext } from "react";
import { ActorRef, EventFrom, SnapshotFrom, fromPromise } from "xstate";
import { liquidityMachine } from ".";
import { useActorRef } from "@xstate/react";
import { Pair, TokenInfoList, TokenMarketingInfo } from "@/interface";
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

  const loadPairList = async () => {
    const pairList = await lcd.wasm.contractQuery<Pair[]>(
      FACTORY_CONTRACT_ADDR,
      {
        pair_list: {},
      },
    );

    const tmpTokens = new Set<string>();

    pairList.map(pair => {
      pair.assets.map(v => {
        if (v["cw20"]) tmpTokens.add(v["cw20"]);
      });
    });

    return pairList;
  };

  const loadTokenInfo = async (pairList: Pair[]) => {
    const tmpTokens = new Set<string>();

    pairList.map(pair => {
      pair.assets.map(v => {
        if (v["cw20"]) tmpTokens.add(v["cw20"]);
      });
    });

    const contractTokens = [...tmpTokens];

    const dataTokenInfo = await Promise.all(
      contractTokens.map(tokenAddr =>
        lcd.wasm.contractQuery<TokenMarketingInfo>(tokenAddr, {
          marketing_info: {},
        }),
      ),
    );

    let tokensInfo: TokenInfoList = {};

    dataTokenInfo.map((info, i) => {
      tokensInfo = { ...tokensInfo, [contractTokens[i]]: info };
    });

    return tokensInfo;
  };

  const actorRef = useActorRef(
    liquidityMachine.provide({
      actors: {
        loadPairList: fromPromise(() => loadPairList()),
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
