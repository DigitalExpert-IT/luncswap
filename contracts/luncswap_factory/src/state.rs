use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, CanonicalAddr, Decimal};
use cw20::Denom;
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Config {
    pub owner: CanonicalAddr,
    pub pair_code_id: u64,
    pub lp_token_code_id: u64,
    pub protocol_fee_recipient: String,
    pub protocol_fee_percent: Decimal,
}

#[cw_serde]
pub struct Asset {
    pub denom: Denom,
    pub decimal: u8,
}

#[cw_serde]
pub struct Pair {
    pub pair_key: Vec<u8>,
    pub assets: [Denom; 2],
    pub contract_address: Addr,
    pub lp_token_address: Addr,
}

impl Pair {
    pub fn to_pair_response(&self) -> crate::msg::PairResponse {
        crate::msg::PairResponse {
            contract_address: self.contract_address.clone().into(),
            lp_address: self.lp_token_address.clone().into(),
            assets: self.assets.clone(),
        }
    }
}

fn denom_to_bytes<'a>(denom: &'a Denom) -> &[u8] {
    match denom {
        Denom::Native(d) => d.as_bytes(),
        Denom::Cw20(address) => address.as_bytes(),
    }
}

pub fn get_pair_key(denoms: &[Denom; 2]) -> Vec<u8> {
    let mut denoms = denoms.to_vec();
    denoms.sort_by(|a, b| {
        let a = denom_to_bytes(a);
        let b = denom_to_bytes(b);
        a.cmp(b)
    });
    [denom_to_bytes(&denoms[0]), denom_to_bytes(&denoms[1])].concat()
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const PAIRS: Map<&[u8], Pair> = Map::new("pairs");
