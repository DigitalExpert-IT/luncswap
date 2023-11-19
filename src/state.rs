use serde::{Deserialize, Serialize};
use cw20::Denom;
use cw_storage_plus::Item;
use cosmwasm_std::{Addr, Decimal, Uint128};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Token {
	pub reserve: Uint128,
	pub denom: Denom,
}

pub const TOKEN1: Item<Token> = Item::new("token1");
pub const TOKEN2: Item<Token> = Item::new("token2");

pub const OWNER: Item<Option<Addr>> = Item::new("owner");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Fees {
	pub protocol_fee_recipient: Addr,
	pub protocol_fee_percent: Decimal,
}

pub const FEES: Item<Fees> = Item::new("fees");
