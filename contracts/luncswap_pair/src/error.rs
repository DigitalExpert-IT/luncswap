use cosmwasm_std::{StdError, Uint128};
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Semver parsing error: {0}")]
    SemVer(String),

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

    #[error("Swap min error: min: {min}, available: {available}")]
    SwapMinError { min: Uint128, available: Uint128 },

    #[error("MsgExpirationError")]
    MsgExpirationError {},

    #[error("Uknown reply id: {id}")]
    UnknownReplyId { id: u64 },

    #[error("Failed to instantiate lp token")]
    InstantiateLpTokenError {},

    #[error("No liquidity")]
    NoLiquidityError {},

    #[error("Conversion Overflow")]
    ConversionOverflowError {},

    #[error("Minimum Token1 Error, requested: {requested}, available: {available}")]
    MinToken1Error {
        requested: Uint128,
        available: Uint128,
    },

    #[error("Minimum Token2 Error, requested: {requested}, available: {available}")]
    MinToken2Error {
        requested: Uint128,
        available: Uint128,
    },

    #[error("Invalid pair initiation")]
    InvalidPairInitiation {},
}

impl From<semver::Error> for ContractError {
    fn from(err: semver::Error) -> Self {
        Self::SemVer(err.to_string())
    }
}
