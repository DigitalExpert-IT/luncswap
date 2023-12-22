import { CONTRACT_LIST } from "@/config";
import { useConnectedWallet, useLcdClient } from "@terra-money/wallet-kit";
import { MsgExecuteContract } from "@terra-money/feather.js";
import { useExecuteContract, useMount } from ".";
import { useContext } from "react";
import { AppContext } from "@/provider";
import { Denom, Pair } from "@/interface";
import { useSnapshot } from "valtio";

const CHAIN_ID = "pisco-1";
const CONTRACT_ADDRESS = CONTRACT_LIST[CHAIN_ID].factory;

export const useFactoryContract = () => {
  const lcd = useLcdClient();
  const connectedWallet = useConnectedWallet();
  const { factory } = useContext(AppContext);
  const [addpairExec] = useExecuteContract();
  const { pairList, loadingPairList } = useSnapshot(factory);

  const addPair = async () => {
    if (!connectedWallet) return;
    const addPairMsg = new MsgExecuteContract(
      connectedWallet.addresses[CHAIN_ID],
      CONTRACT_ADDRESS,
      {
        add_pair: {
          token1_denom: { native: "luna" },
          token2_denom: {
            cw20: "terra1w5c853etgdrhp5uhum0xade3qrz5a33pv52fhkxqzya9mkx2225sw58aq7",
          },
        },
      },
      undefined,
    );
    const res = await addpairExec([addPairMsg]);
    console.log(res);
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
      factory.pairList = factory.pairList.concat(pairList);

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
    }
  };

  useMount(() => {
    loadList();
  });

  return { pairList, addPair, isLoading: loadingPairList };
};
