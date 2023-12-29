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

export type PairFee = {
  owner: string | null;
  protocol_fee_percent: number;
  protocol_fee_recipient: string;
};

export enum TokenSelect {
  Token1,
  Token2,
}

export type SwapRequest = {
  input_token: TokenSelect;
  input_amount: string;
  min_output: string;
};

export type AddLiquidityRequest = {
  token1_amount: string;
  min_liquidity: string;
  max_token2: string;
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
  isNative?: boolean;
  info: TokenInfo;
  marketing: TokenMarketingInfo;
  address: string;
};
