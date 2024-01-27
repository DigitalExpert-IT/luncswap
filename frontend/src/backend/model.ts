import { TxInfo } from "@terra-money/terra.js";

type Base = {
  hash: string;
  contractAddress: string;
  blockHeight: number;
  timestamp: Date;
  tx: TxInfo;
};

export type PairInfo = Base & {
  type: "pair_info";
  sender: string;
  lpTokenContractAddress: string;
  factoryContractAddress: string;
};

export type PriceChangeInfo = Base & {
  type: "price_change";
  eventType: string;
  token1Reserve: string;
  token2Reserve: string;
};
