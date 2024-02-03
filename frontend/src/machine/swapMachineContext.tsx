/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActorRef, EventFrom, SnapshotFrom, fromPromise } from "xstate";
import { CreatePairInputType, swapMachine } from "./swapMachine";
import React, { createContext } from "react";
import { useActorRef } from "@xstate/react";
import { useConnectedWallet, useLcdClient } from "@terra-money/wallet-kit";
import { Pair, PairFee, PairInfo, TokenMeta } from "@/interface";
import { factoryContractAddress } from "@/constant/network";
import { Coin, Dec, Msg, MsgExecuteContract } from "@terra-money/feather.js";
import { useExecuteContract } from "@/hooks";
import { useToast } from "@chakra-ui/react";
import { getConfig } from "@/lib/config";

type EventType = EventFrom<typeof swapMachine>;
type SnapshotType = SnapshotFrom<typeof swapMachine>;

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });

export const SwapMachineContext = createContext<{
  swapActor: ActorRef<SnapshotType, EventType>;
}>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  swapActor: undefined as any,
});

const { chainId } = getConfig()
const FACTORY_CONTRACT_ADDR = factoryContractAddress[chainId as "pisco-1"];

export function SwapMachineProvider(props: { children: React.ReactNode }) {
  const lcd = useLcdClient();
  const connectedWallet = useConnectedWallet();
  const [executeContract] = useExecuteContract();
  const toast = useToast();

  const refetchPairInfo = async (pair: Pair) => {
    return await lcd.wasm.contractQuery<PairInfo>(pair.contract_address, {
      info: {},
    });
  };

  const swap = async (
    pair: Pair,
    inputKind: 1 | 2,
    inputTokenMeta: TokenMeta,
    inputTokenAmount: Dec,
    outputAmount: Dec,
  ) => {
    if (!connectedWallet) return;
    const walletAddr = connectedWallet.addresses[chainId];
    const msgs: Msg[] = [];
    if (!inputTokenMeta.isNative) {
      // increase allowance
      const increaseAllowanceMsg = new MsgExecuteContract(
        walletAddr,
        inputTokenMeta.address,
        {
          increase_allowance: {
            spender: pair.contract_address,
            amount: inputTokenAmount.toFixed(0),
          },
        },
      );
      msgs.push(increaseAllowanceMsg);
    }

    const funds = inputTokenMeta.isNative
      ? [
        Coin.fromAmino({
          amount: inputTokenAmount.toFixed(0),
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
          input_amount: inputTokenAmount.toFixed(0),
          // 0.5 slippage
          min_output: outputAmount
            .sub(outputAmount.mul(0.5).div(100))
            .toFixed(0),
        },
      },
      funds,
    );
    msgs.push(swapMsg);
    await executeContract(msgs);
    toast({
      status: "success",
      description: "Swap Success",
    });
  };

  const loadTokenBalance = async (token1: TokenMeta, token2: TokenMeta) => {
    if (!connectedWallet)
      return { token1Balance: new Dec(0), token2Balance: new Dec(0) };
    const nativeBalances = (
      await lcd.bank.balance(connectedWallet.addresses[chainId])
    )[0].toArray();

    const token1Balance = token1.isNative
      ? new Dec(
        nativeBalances
          .find(item => item.denom === token1.info.symbol)
          ?.amount.toNumber() ?? 0,
      )
      : new Dec(
        (
          await lcd.wasm.contractQuery<{ balance: string }>(token1.address, {
            balance: { address: connectedWallet.addresses[chainId] },
          })
        ).balance,
      );

    const token2Balance = token2.isNative
      ? new Dec(
        nativeBalances
          .find(item => item.denom === token2.info.symbol)
          ?.amount.toNumber() ?? 0,
      )
      : new Dec(
        (
          await lcd.wasm.contractQuery<{ balance: string }>(token2.address, {
            balance: { address: connectedWallet.addresses[chainId] },
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

    const pairFee = await lcd.wasm.contractQuery<PairFee>(
      pair.contract_address,
      {
        fee: {},
      },
    );
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
    return { pair, pairFee, pairInfo, token1Meta, token2Meta };
  };

  const addLiquidity = async (
    pair: Pair,
    token1Amount: Dec,
    maxToken2Amount: Dec,
  ) => {
    if (!connectedWallet) return;
    const walletAddr = connectedWallet.addresses[chainId];
    const token1Denom = pair.assets[0] as any;
    const token2Denom = pair.assets[1] as any;
    const msgs: Msg[] = [];
    const funds: Coin[] = [];

    if (token1Denom.cw20) {
      msgs.push(
        new MsgExecuteContract(walletAddr, token1Denom.cw20, {
          increase_allowance: {
            spender: pair.contract_address,
            amount: token1Amount.toFixed(0),
          },
        }),
      );
    } else {
      funds.push(
        Coin.fromAmino({
          denom: token1Denom.native,
          amount: token1Amount.toFixed(0),
        }),
      );
    }

    if (token2Denom.cw20) {
      msgs.push(
        new MsgExecuteContract(walletAddr, token2Denom.cw20, {
          increase_allowance: {
            spender: pair.contract_address,
            amount: maxToken2Amount.toFixed(0),
          },
        }),
      );
    } else {
      funds.push(
        Coin.fromAmino({
          denom: token2Denom.native,
          amount: maxToken2Amount.toFixed(0),
        }),
      );
    }

    const addLiquidityMsg = new MsgExecuteContract(
      walletAddr,
      pair.contract_address,
      {
        add_liquidity: {
          token1_amount: token1Amount.toFixed(0),
          max_token2: maxToken2Amount.toFixed(0),
          min_liquidity: "0",
        },
      },
      funds,
    );
    msgs.push(addLiquidityMsg);

    await executeContract(msgs);
    toast({
      status: "success",
      description: "Add Liquidity Success",
    });
  };

  const createPair = async (input: CreatePairInputType) => {
    const walletAddr = connectedWallet!.addresses[chainId];
    const token1Denom = input.token1Meta.isNative
      ? { native: input.token1Meta.info.symbol }
      : {
        cw20: input.token1Meta.address,
      };
    const token2Denom = input.token2Meta.isNative
      ? { native: input.token2Meta.info.symbol }
      : {
        cw20: input.token2Meta.address,
      };
    const createPairMsg = new MsgExecuteContract(
      walletAddr,
      FACTORY_CONTRACT_ADDR,
      {
        add_pair: {
          token1_denom: token1Denom,
          token2_denom: token2Denom,
        },
      },
    );
    await executeContract([createPairMsg]);
    // wait 10 sec
    await sleep(1000 * 10);
    const pair = await lcd.wasm.contractQuery<Pair>(FACTORY_CONTRACT_ADDR, {
      pair: { token1: token1Denom, token2: token2Denom },
    });

    await addLiquidity(pair, input.token1Amount, input.token2Amount);
    return [input.token1Meta, input.token2Meta] as [TokenMeta, TokenMeta];
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
            input.inputKind === 1 ? input.token2Amount : input.token1Amount,
          );
        }),
        refetchPairInfo: fromPromise(({ input }) => refetchPairInfo(input)),
        addLiquidity: fromPromise(({ input }) =>
          addLiquidity(input.pair, input.token1Amount, input.maxToken2Amount),
        ),
        createPair: fromPromise(({ input }) => createPair(input)),
      },
      actions: {
        errorCb: ({ event }: any) => {
          console.log(event);
          const errorMsg = event?.error?.raw_log ?? "Unknown Error";
          toast({
            status: "error",
            description: errorMsg,
          });
        },
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
