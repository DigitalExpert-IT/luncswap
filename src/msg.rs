use cosmwasm_std::Decimal;
use cw20::Denom;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct InstantiateMsg {
    pub token1_denom: Denom,
    pub token2_denom: Denom,
    pub owner: Option<String>,
    pub protocol_fee_recipient: String,
    pub protocol_fee_percent: Decimal,
}
