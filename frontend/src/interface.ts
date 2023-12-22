export type Denom =
  | {
      native: string;
    }
  | { cw20: string };

export type Pair = {
  assets: [Denom, Denom];
  contract_address: string;
  lp_address: string;
};
