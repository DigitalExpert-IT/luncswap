use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Decimal, Uint128};
use cw20::Denom;

#[cw_serde]
pub struct InstantiateMsg {
    pub token1_denom: Denom,
    pub token2_denom: Denom,
    pub owner: Option<String>,
    pub protocol_fee_recipient: String,
    pub protocol_fee_percent: Decimal,
    pub lp_token_code_id: u64,
}

#[cw_serde]
pub enum QueryMsg {
    Balance { address: String },
    Info {},
    Token1ForToken2Price { token1_amount: Uint128 },
    Token2ForToken1Price { token2_amount: Uint128 },
    Fee {},
}

#[cw_serde]
pub enum TokenSelect {
    Token1,
    Token2,
}

#[cw_serde]
pub enum ExecuteMsg {
    AddLiquidity {
        token1_amount: Uint128,
        min_liquidity: Uint128,
        max_token2: Uint128,
    },
    RemoveLiquidity {
        amount: Uint128,
        min_token1: Uint128,
        min_token2: Uint128,
    },
    Swap {
        input_token: TokenSelect,
        input_amount: Uint128,
        min_output: Uint128,
    },
}

#[cw_serde]
pub struct InfoResponse {
    pub token1_reserve: Uint128,
    pub token1_denom: Denom,
    pub token2_reserve: Uint128,
    pub token2_denom: Denom,
    pub lp_token_address: Addr,
}

#[cw_serde]
pub struct FeeResponse {
    pub owner: Option<String>,
    pub protocol_fee_percent: Decimal,
    pub protocol_fee_recipient: String,
}

#[cw_serde]
pub struct Token1ForToken2PriceResponse {
    pub token2_amount: Uint128,
}

#[cw_serde]
pub struct Token2ForToken1PriceResponse {
    pub token1_amount: Uint128,
}
