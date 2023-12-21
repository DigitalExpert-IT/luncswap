import { useState, useEffect } from "react";
import { useLcdClient } from "@terra-money/wallet-kit";

export const useQueryContract = (params: string | object) => {
  const [response, setResponse] = useState([]);
  const [tokenBalance, setTokenBalance] = useState("");
  const lcd = useLcdClient();

  // TODO:
  // 1 . type response contract useQueryContract, handle loading and error
  // 2 .

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPairList = async () => {
    const data: never = await lcd.wasm.contractQuery(
      "terra1zg4njgu40t3nu0yxnf03y8mjaghzsmljfh0lj9m2793ewswg4mxqcgt3uq",
      params,
    );
    setResponse(data);
  };

  const getTokenBalances = async () => {
    const tokenAddress =
      "terra109ez70kqqt602rkk63djd0eh6w9cy6847khx40m2spw2jvm7hglq409yys";
    const walletAddress = "terra1u4ynjgcfz2sqmt404h9hlkxvzxv38dq6zjlx2t";
    const balances: string = await lcd.wasm.contractQuery(tokenAddress, {
      balance: { address: walletAddress },
    });

    setTokenBalance(balances);
  };

  useEffect(() => {
    getPairList();
    getTokenBalances();
  }, []);

  return { response, tokenBalance };
};
