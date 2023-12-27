import { ActorRef, EventFrom, SnapshotFrom, fromPromise } from "xstate";
import { swapMachine } from "./swapMachine";
import React, { createContext } from "react";
import { useActorRef } from "@xstate/react";
import { useConnectedWallet, useLcdClient } from "@terra-money/wallet-kit";
import { Pair, PairInfo, TokenMeta } from "@/interface";
import { factoryContractAddress } from "@/constant/network";
import { Coin, Msg, MsgExecuteContract } from "@terra-money/feather.js";
import { useExecuteContract } from "@/hooks";

type EventType = EventFrom<typeof swapMachine>;
type SnapshotType = SnapshotFrom<typeof swapMachine>;

export const SwapMachineContext = createContext<{
  swapActor: ActorRef<SnapshotType, EventType>;
}>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  swapActor: undefined as any,
});

const CHAIN_ID = "pisco-1";
const FACTORY_CONTRACT_ADDR = factoryContractAddress[CHAIN_ID];

export function SwapMachineProvider(props: { children: React.ReactNode }) {
  const lcd = useLcdClient();
  const connectedWallet = useConnectedWallet();
  const [executeContract] = useExecuteContract();

  const refetchPairInfo = async (pair: Pair) => {
    return await lcd.wasm.contractQuery<PairInfo>(pair.contract_address, {
      info: {},
    });
  };

  const swap = async (
    pair: Pair,
    inputKind: 1 | 2,
    inputTokenMeta: TokenMeta,
    inputTokenAmount: bigint,
    // outputAmount: bigint,
  ) => {
    if (!connectedWallet) return;
    const walletAddr = connectedWallet.addresses[CHAIN_ID];
    const msgs: Msg[] = [];
    if (!inputTokenMeta.isNative) {
      // increase allowance
      const increaseAllowanceMsg = new MsgExecuteContract(
        walletAddr,
        inputTokenMeta.address,
        {
          increase_allowance: {
            spender: pair.contract_address,
            amount: inputTokenAmount.toString(),
          },
        },
      );
      msgs.push(increaseAllowanceMsg);
    }

    const funds = inputTokenMeta.isNative
      ? [
          Coin.fromAmino({
            amount: inputTokenAmount.toString(),
            denom: inputTokenMeta.info.symbol,
          }),
        ]
      : [];

    const swapMsg = new MsgExecuteContract(
      walletAddr,
      pair.contract_address,
      {
        swap: {
          input_token: inputKind === 1 ? "token1" : "token2",
          input_amount: inputTokenAmount.toString(),
          min_output: "0",
        },
      },
      funds,
    );
    msgs.push(swapMsg);
    await executeContract(msgs);
  };

  const loadTokenBalance = async (token1: TokenMeta, token2: TokenMeta) => {
    if (!connectedWallet)
      return { token1Balance: BigInt(0), token2Balance: BigInt(0) };
    const nativeBalances = (
      await lcd.bank.balance(connectedWallet.addresses[CHAIN_ID])
    )[0].toArray();

    const token1Balance = token1.isNative
      ? BigInt(
          nativeBalances
            .find(item => item.denom === token1.info.symbol)
            ?.amount.toNumber() ?? 0,
        )
      : BigInt(
          (
            await lcd.wasm.contractQuery<{ balance: string }>(token1.address, {
              balance: { address: connectedWallet.addresses[CHAIN_ID] },
            })
          ).balance,
        );

    const token2Balance = token2.isNative
      ? BigInt(
          nativeBalances
            .find(item => item.denom === token2.info.symbol)
            ?.amount.toNumber() ?? 0,
        )
      : BigInt(
          (
            await lcd.wasm.contractQuery<{ balance: string }>(token2.address, {
              balance: { address: connectedWallet.addresses[CHAIN_ID] },
            })
          ).balance,
        );

    return { token1Balance, token2Balance };
  };

  const loadPair = async (assets: [TokenMeta, TokenMeta]) => {
    const token1Denom = assets[0].isNative
      ? { native: assets[0].info.symbol }
      : { cw20: assets[0].address };
    const token2Denom = assets[1].isNative
      ? { native: assets[1].info.symbol }
      : { cw20: assets[1].address };

    const pair = await lcd.wasm.contractQuery<Pair>(FACTORY_CONTRACT_ADDR, {
      pair: { token1: token1Denom, token2: token2Denom },
    });

    if (!pair) return undefined;

    const pairInfo = await lcd.wasm.contractQuery<PairInfo>(
      pair.contract_address,
      {
        info: {},
      },
    );
    const token1Meta = compareDenomWithMeta(pairInfo.token1_denom, assets[0])
      ? assets[0]
      : assets[1];
    const token2Meta =
      token1Meta.address === assets[1].address ? assets[0] : assets[1];
    return { pair, pairInfo, token1Meta, token2Meta };
  };

  const actorRef = useActorRef(
    swapMachine.provide({
      actors: {
        loadPair: fromPromise(({ input }) => loadPair(input)),
        loadTokenBalance: fromPromise(({ input }) =>
          loadTokenBalance(input.token1, input.token2),
        ),
        swap: fromPromise(({ input }) => {
          return swap(
            input.pair!,
            input.inputKind,
            input.inputKind === 1 ? input.token1Meta! : input.token2Meta!,
            input.inputKind === 1 ? input.token1Amount : input.token2Amount,
            // input.inputKind === 1 ? input.token2Amount : input.token1Amount,
          );
        }),
        refetchPairInfo: fromPromise(({ input }) => refetchPairInfo(input)),
      },
      actions: {
        errorCb: console.error,
      },
    }),
  );

  return (
    <SwapMachineContext.Provider value={{ swapActor: actorRef }}>
      {props.children}
    </SwapMachineContext.Provider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compareDenomWithMeta = (denom: any, meta: TokenMeta) => {
  if (denom.native && meta.isNative) return true;
  if (denom.cw20 === meta.address) return true;
  return false;
};
