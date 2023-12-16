import { LCDClient, Msg, TxInfo } from "@terra-money/feather.js";
import { PostResponse, useLcdClient, useWallet } from "@terra-money/wallet-kit";
import { useCallback, useState } from "react";

const sleep = (ms = 500) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });

const waitForTx = async (
  tx: PostResponse,
  lcd: LCDClient,
  retries = 1,
): Promise<TxInfo> => {
  try {
    const txInfo = await lcd.tx.txInfo(tx.txhash, "pisco-1");
    return txInfo;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (retries === 10) throw error;
    if (error?.response?.status === 404) {
      await sleep(retries * 500);
      return await waitForTx(tx, lcd, retries + 1);
    }

    throw error;
  }
};

export const useExecuteContract = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [result, setResult] = useState<TxInfo>();
  const wallet = useWallet();
  const lcd = useLcdClient();

  const exec = useCallback(
    async (msgs: Msg[]) => {
      setError(undefined);
      setResult(undefined);
      setLoading(true);
      try {
        const tx = await wallet.post({
          chainID: "pisco-1",
          msgs,
        });
        const txInfo = await waitForTx(tx, lcd);
        setResult(txInfo);
        return txInfo;
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [wallet, lcd],
  );

  return [exec, { isLoading, error, data: result }] as const;
};
