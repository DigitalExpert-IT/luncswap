use cosmwasm_schema::cw_serde;
use cosmwasm_std::Decimal;
use cw20::Denom;

#[cw_serde]
pub struct InstantiateMsg {
    pub lp_token_code_id: u64,
    pub pair_code_id: u64,
    pub protocol_fee_recipient: String,
    pub protocol_fee_percent: Decimal,
}

#[cw_serde]
pub enum ExecuteMsg {
    AddPair {
        token1_denom: Denom,
        token2_denom: Denom,
    },
}

#[cw_serde]
pub struct PairMsg {
    pub token1: Denom,
    pub token2: Denom,
}

#[cw_serde]
pub enum QueryMsg {
    Pair { token1: Denom, token2: Denom },
    PairList { after: Option<PairMsg> },
}

#[cw_serde]
pub struct MigrateMsg {}

#[cw_serde]
pub struct PairResponse {
    pub contract_address: String,
    pub lp_address: String,
    pub assets: [Denom; 2],
}
