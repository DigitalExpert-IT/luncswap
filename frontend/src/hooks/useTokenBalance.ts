import { getConfig } from "@/lib/config";
import { useLcdClient, useConnectedWallet } from "@terra-money/wallet-kit";
import { useEffect, useState } from "react";

const { chainId } = getConfig()


export const useTokenBalance = (tokenAddress: string) => {
  const wallet = useConnectedWallet();
  const [tokenBalance, setTokenBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lcd = useLcdClient();
  const walletAddress = wallet?.addresses[chainId];

  useEffect(() => {
    const getTokenBalances = async () => {
      setIsLoading(true);
      try {
        if (!wallet) {
          setTokenBalance("Connect Wallet");
          return;
        }
        if (tokenAddress === "native") {
          await lcd.bank.balance(wallet.addresses[chainId]).then(([coins]) => {
            const numericPart = coins.toString().match(/\d+/);
            setTokenBalance(numericPart ? numericPart.toString() : "0");
          });
          return;
        }
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
