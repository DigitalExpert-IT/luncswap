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

export type PairInfo = {
  token1_denom: Denom;
  token1_reserve: string;
  token2_denom: Denom;
  token2_reserve: string;
};

export type PairWithKey = Pair & {
  key: string;
};

export type TokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: string;
};

export type TokenMarketingInfo = {
  description: string | null;
  logo: string | null;
  marketing: string | null;
  project: string | null;
};

export type TokenMeta = {
  info: TokenInfo;
  marketing: TokenMarketingInfo;
  address: string;
};
