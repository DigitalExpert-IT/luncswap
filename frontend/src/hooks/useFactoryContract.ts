/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONTRACT_LIST } from "@/config";
import { useConnectedWallet, useLcdClient } from "@terra-money/wallet-kit";
import { MsgExecuteContract, Coin } from "@terra-money/feather.js";
import { useExecuteContract, useMount } from ".";
import { useContext } from "react";
import { AppContext } from "@/provider";
import {
  AddLiquidityRequest,
  Denom,
  Pair,
  PairInfo,
  SwapRequest,
  TokenInfo,
  TokenMarketingInfo,
} from "@/interface";
import { useSnapshot } from "valtio";
import { getPairKey } from "@/lib/pair";

const CHAIN_ID = "pisco-1";
const CONTRACT_ADDRESS = CONTRACT_LIST[CHAIN_ID].factory;

export const useFactoryContract = () => {
  const lcd = useLcdClient();
  const connectedWallet = useConnectedWallet();
  const { factory } = useContext(AppContext);
  const [addPairExec] = useExecuteContract();
  const [swapExec] = useExecuteContract();
  const [addLiquidityExec] = useExecuteContract();
  const [increaseAllowanceExec] = useExecuteContract();
  const { pairList, tokenList, loadingPairList, loadingTokenList } =
    useSnapshot(factory);

  const storePairList = async (pairList: Pair[]) => {
    factory.loadingTokenList = true;
    const denomSet = new Set<string>();
    factory.pairList = factory.pairList.concat(
      pairList.map(item => {
        item.assets.forEach(denom => {
          denom = denom as { cw20: string };
          if (denom.cw20) {
            denomSet.add(denom.cw20);
          }
        });

        return {
          ...item,
          key: getPairKey(item.assets),
        };
      }),
    );

    const promises = [];
    for (const cw20Addr of denomSet) {
      const cw20InfoPromise = lcd.wasm.contractQuery(cw20Addr, {
        token_info: {},
      });
      const marketingInfoPromise = lcd.wasm.contractQuery(cw20Addr, {
        marketing_info: {},
      });
      promises.push(cw20InfoPromise);
      promises.push(marketingInfoPromise);
    }
    const denomListResult = await Promise.all(promises);
    const denomIter = denomSet.values();
    let currentDenom = denomIter.next();
    for (let i = 0; i < denomListResult.length; i = i + 2) {
      const tokenInfo = denomListResult[i] as TokenInfo;
      const marketingInfo = denomListResult[i + 1] as TokenMarketingInfo;
      factory.tokenList.push({
        address: currentDenom.value,
        info: tokenInfo,
        marketing: marketingInfo,
      });
      currentDenom = denomIter.next();
    }
    factory.loadingTokenList = false;
  };

  const loadPairByDenom = async (token1: Denom, token2: Denom) => {
    const pair = await lcd.wasm.contractQuery<Pair>(CONTRACT_ADDRESS, {
      pair: { token1, token2 },
    });
    await storePairList([pair]);
  };

  const findPair = (token1: Denom, token2: Denom) => {
    const key = getPairKey([token1, token2]);
    return factory.pairList.find(item => item.key === key);
  };

  const addPair = async (token1: Denom, token2: Denom) => {
    if (!connectedWallet) return;
    const addPairMsg = new MsgExecuteContract(
      connectedWallet.addresses[CHAIN_ID],
      CONTRACT_ADDRESS,
      {
        add_pair: {
          token1_denom: token1,
          token2_denom: token2,
        },
      },
      undefined,
    );
    await addPairExec([addPairMsg]);
    await loadPairByDenom(token1, token2);
  };

  const loadList = async (after?: { token1: Denom; token2: Denom }) => {
    if (factory.loadingPairList) return;
    factory.loadingPairList = true;
    try {
      const pairList = await lcd.wasm.contractQuery<Pair[]>(CONTRACT_ADDRESS, {
        pair_list: {
          after,
        },
      });
      await storePairList(pairList);

      // because the limit of pagination in pair_list is 10
      // then if the returned pairlist length is 10, probably there's more
      // pair that can be loaded
      if (pairList.length === 10) {
        factory.loadingPairList = false;
        const lastPair = pairList[9]!;
        await loadList({
          token1: lastPair.assets[0],
          token2: lastPair.assets[1],
        });
      }
    } catch (err) {
      // log error here
    } finally {
      factory.loadingPairList = false;
      factory.initialized = true;
    }
  };

  const loadPair = async (
    assets: [Denom, Denom],
  ): Promise<[Pair, PairInfo]> => {
    const pair = findPair(assets[0], assets[1]);
    if (!pair) throw {};
    const pairInfo = await lcd.wasm.contractQuery<PairInfo>(
      pair.contract_address,
      { info: {} },
    );
    return [pair, pairInfo];
  };

  const swap = async (contractAddr: string, input: SwapRequest) => {
    if (!connectedWallet) return;
    const swapMsg = new MsgExecuteContract(
      connectedWallet.addresses[CHAIN_ID],
      contractAddr,
      {
        swap: input,
      },
      undefined,
    );
    await swapExec([swapMsg]);
  };

  const addLiquidity = async (
    contractAddr: string,
    input: AddLiquidityRequest,
  ) => {
    if (!connectedWallet) return;
    const addLiquidityMsg = new MsgExecuteContract(
      connectedWallet.addresses[CHAIN_ID],
      contractAddr,
      {
        add_liquidity: input,
      },
      [
        Coin.fromAmino({
          denom: "uluna",
          amount: "1000000",
        }),
      ],
    );
    await addLiquidityExec([addLiquidityMsg]);
  };

  const increaseAllowance = async (
    denom: Denom,
    spender: string,
    amount: string,
  ) => {
    if (!connectedWallet) return;
    if ((denom as any).native) return;
    const contractAddr = (denom as any).cw20;
    const increaseAllowanceMsg = new MsgExecuteContract(
      connectedWallet.addresses[CHAIN_ID],
      contractAddr,
      {
        increase_allowance: {
          spender,
          amount,
        },
      },
    );
    await increaseAllowanceExec([increaseAllowanceMsg]);
  };

  useMount(() => {
    if (factory.initialized) return;
    const cursor =
      pairList.length > 0
        ? {
            token1: pairList[pairList.length - 1].assets[0],
            token2: pairList[pairList.length - 1].assets[1],
          }
        : undefined;
    loadList(cursor);
  });

  return {
    pairList,
    loadPair,
    addPair,
    findPair,
    swap,
    addLiquidity,
    increaseAllowance,
    tokenList,
    isLoading: loadingPairList || loadingTokenList,
  };
};
