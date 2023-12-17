import { useConnectedWallet } from "@terra-money/wallet-kit";
import config from "../refs.terrain.json";

export const useQueryContract = () => {
  const connectedWallet = useConnectedWallet();

  const getContractAddress = () => {
    const NETWORK_NAME = connectedWallet ? connectedWallet.network : null;

    return config.testnet[NETWORK_NAME].luncswap_token.contractAddresses;
  };

  return {
    getContractAddress,
  };
};
