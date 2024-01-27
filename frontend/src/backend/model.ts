import { TxInfo } from "@terra-money/terra.js";

export type PairInfo = {
  type: "pair_info";
  hash: string;
  contractAddress: string;
  sender: string;
  lpTokenContractAddress: string;
  factoryContractAddress: string;
  blockHeight: number;
  timestamp: Date;
  tx: TxInfo;
};
