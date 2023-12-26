import { TokenInfo, TokenMarketingInfo, TokenMeta } from "@/interface";
import { useLcdClient } from "@terra-money/wallet-kit";
import { useState } from "react";
import { useMount } from ".";
import { nativeCoin, trustedTokens } from "@/constant/network";

const CHAIN_ID = "pisco-1";
const CACHE_KEY = "TOKEN_LIST_CACHE";
const storeCache = (tokenList: TokenMeta[]) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(tokenList, null, 2));
  } catch (error) {
    // ignore error
  }
};
const restoreCache = (): TokenMeta[] => {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "[]");
  } catch (error) {
    return [];
  }
};

export const useTokenList = () => {
  const lcd = useLcdClient();
  const [isLoading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState<TokenMeta[]>(restoreCache());

  useMount(() => {
    setTokenList([nativeCoin[CHAIN_ID]]);

    const fetchTokenList = async () => {
      setLoading(true);
      try {
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
        storeCache(tokenMetaList);
        setTokenList(prev => [...prev, ...tokenMetaList]);
      } catch (error) {
        // TODO: handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTokenList();
  });

  return { isLoading, tokenList };
};
