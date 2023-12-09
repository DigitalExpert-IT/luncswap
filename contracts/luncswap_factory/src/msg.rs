use cosmwasm_std::Decimal;
use cw20::Denom;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub lp_token_code_id: u64,
    pub pair_code_id: u64,
    pub protocol_fee_recipient: String,
    pub protocol_fee_percent: Decimal,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, JsonSchema)]
pub enum ExecuteMsg {
    AddPair {
        token1_denom: Denom,
        token2_denom: Denom,
    },
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, JsonSchema)]
pub enum QueryMsg {
    Pair { token1: Denom, token2: Denom },
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, JsonSchema)]
pub struct PairResponse {
    pub contract_address: String,
    pub lp_address: String,
}
