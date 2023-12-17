import { useState, useEffect } from "react";
import { useLcdClient } from "@terra-money/wallet-kit";

export const useQueryContract = (params: string | object) => {
  const [response, setResponse] = useState([]);
  const lcd = useLcdClient();

  // TODO:
  // 1 . type response contract useQueryContract, handle loading and error
  // 2 .

  useEffect(() => {
    const getQuery = async () => {
      const data = await lcd.wasm.contractQuery(
        "terra1zg4njgu40t3nu0yxnf03y8mjaghzsmljfh0lj9m2793ewswg4mxqcgt3uq",
        params,
      );
      setResponse(data);
    };
    getQuery();
  }, []);

  return { response };
};
