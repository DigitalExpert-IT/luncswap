import { useLcdClient, useConnectedWallet } from "@terra-money/wallet-kit";
import { useEffect, useState } from "react";

export const useTokenBalance = (tokenAddress: string) => {
  const wallet = useConnectedWallet();
  const [tokenBalance, setTokenBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lcd = useLcdClient();
  const walletAddress = wallet?.addresses["pisco-1"];

  useEffect(() => {
    const getTokenBalances = async () => {
      setIsLoading(true);
      try {
        const balances: { balance: string } = await lcd.wasm.contractQuery(
          tokenAddress,
          {
            balance: { address: walletAddress },
          },
        );
        setTokenBalance(balances.balance);
      } catch (e) {
        setTokenBalance("-");
      } finally {
        setIsLoading(false);
      }
    };
    getTokenBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, walletAddress]);

  return { tokenBalance, isLoading };
};
