use cosmwasm_std::{StdError, Uint128};
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),
    #[error("Insufficient liquidity error: requested: {requested}, available: {available}")]
    InsufficientLiquidityError {
        requested: Uint128,
        available: Uint128,
    },
    #[error("InsufficientFunds")]
    InsufficientFunds {},
    #[error("Incorrect native denom: provided: {provided}, required: {required}")]
    IncorrectNativeDenom { provided: String, required: String },
    #[error("Min Liquidity error: provided: {provided}, minimum: {minimum}")]
    MinLiquidityError { provided: Uint128, minimum: Uint128 },
    #[error("Max Token error: provided: {provided}, maximum: {max}")]
    MaxTokenError { provided: Uint128, max: Uint128 },
}
