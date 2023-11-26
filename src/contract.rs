use crate::msg::{
    FeeResponse, QueryMsg, Token1ForToken2PriceResponse, Token2ForToken1PriceResponse,
};
use crate::{
    error::ContractError,
    msg::{InfoResponse, InstantiateMsg},
    state::{Fees, Token, FEES, OWNER, TOKEN1, TOKEN2},
};
use cosmwasm_std::{
    to_json_binary, Binary, Decimal, Deps, DepsMut, Empty, Env, MessageInfo, Response, StdError,
    StdResult, Uint128, Uint512,
};
use cw20_base::contract::query_balance;

const FEE_SCALE_FACTOR: Uint128 = Uint128::new(10_000);
// const MAX_FEE_PERCENT: &str = "1";
const FEE_DECIMAL_PRECISION: Uint128 = Uint128::new(10u128.pow(20));

pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let token1 = Token {
        reserve: Uint128::zero(),
        denom: msg.token1_denom.clone(),
    };
    TOKEN1.save(deps.storage, &token1)?;

    let token2 = Token {
        reserve: Uint128::zero(),
        denom: msg.token2_denom.clone(),
    };
    TOKEN2.save(deps.storage, &token2)?;

    let owner = msg.owner.map(|h| deps.api.addr_validate(&h)).transpose()?;
    OWNER.save(deps.storage, &owner)?;

    let protocol_fee_recipient = deps.api.addr_validate(&msg.protocol_fee_recipient)?;

    let fees = Fees {
        protocol_fee_percent: msg.protocol_fee_percent,
        protocol_fee_recipient,
    };
    FEES.save(deps.storage, &fees)?;

    Ok(Response::new())
}

pub fn execute(_deps: DepsMut, _env: Env, _info: MessageInfo, _msg: Empty) -> StdResult<Response> {
    unimplemented!()
}

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    use QueryMsg::*;

    match msg {
        Balance { address } => to_json_binary(&query_balance(deps, address)?),
        Info {} => to_json_binary(&query_info(deps)?),
        Token1ForToken2Price { token1_amount } => {
            to_json_binary(&query_token1_for_token2_price(deps, token1_amount)?)
        }
        Token2ForToken1Price { token2_amount } => {
            to_json_binary(&query_token2_for_token1_price(deps, token2_amount)?)
        }
        Fee {} => to_json_binary(&query_fee(deps)?),
    }
}

pub fn query_info(deps: Deps) -> StdResult<InfoResponse> {
    let token1 = TOKEN1.load(deps.storage)?;
    let token2 = TOKEN2.load(deps.storage)?;

    Ok(InfoResponse {
        token1_reserve: token1.reserve,
        token1_denom: token1.denom,
        token2_reserve: token2.reserve,
        token2_denom: token2.denom,
    })
}

fn fee_decimal_to_uint128(decimal: Decimal) -> StdResult<Uint128> {
    let result: Uint128 = decimal
        .atomics()
        .checked_mul(FEE_SCALE_FACTOR)
        .map_err(StdError::overflow)?;

    Ok(result / FEE_DECIMAL_PRECISION)
}

fn get_input_price(
    input_amount: Uint128,
    input_reserve: Uint128,
    output_reserve: Uint128,
    fee_percent: Decimal,
) -> StdResult<Uint128> {
    if input_reserve == Uint128::zero() || output_reserve == Uint128::zero() {
        return Err(cosmwasm_std::StdError::GenericErr {
            msg: "No liquidity".into(),
        });
    };

    let fee_percent = fee_decimal_to_uint128(fee_percent)?;
    let fee_reduction_percent = FEE_SCALE_FACTOR - fee_percent;
    let input_amount_with_fee = Uint512::from(input_amount.full_mul(fee_reduction_percent));
    let numerator = input_amount_with_fee
        .checked_mul(Uint512::from(output_reserve))
        .map_err(StdError::overflow)?;
    let denominator = Uint512::from(input_reserve)
        .checked_mul(Uint512::from(FEE_SCALE_FACTOR))
        .map_err(StdError::overflow)?
        .checked_add(input_amount_with_fee)
        .map_err(StdError::overflow)?;

    Ok(numerator
        .checked_div(denominator)
        .map_err(StdError::divide_by_zero)?
        .try_into()?)
}

pub fn query_token1_for_token2_price(
    deps: Deps,
    token1_amount: Uint128,
) -> StdResult<Token1ForToken2PriceResponse> {
    let token1 = TOKEN1.load(deps.storage)?;
    let token2 = TOKEN2.load(deps.storage)?;

    let fees = FEES.load(deps.storage)?;
    let total_fee_percent = fees.protocol_fee_percent;
    let token2_amount = get_input_price(
        token1_amount,
        token1.reserve,
        token2.reserve,
        total_fee_percent,
    )?;

    Ok(Token1ForToken2PriceResponse { token2_amount })
}

pub fn query_token2_for_token1_price(
    deps: Deps,
    token2_amount: Uint128,
) -> StdResult<Token2ForToken1PriceResponse> {
    let token1 = TOKEN1.load(deps.storage)?;
    let token2 = TOKEN2.load(deps.storage)?;

    let fees = FEES.load(deps.storage)?;
    let total_fee_percent = fees.protocol_fee_percent;
    let token1_amount = get_input_price(
        token2_amount,
        token2.reserve,
        token1.reserve,
        total_fee_percent,
    )?;

    Ok(Token2ForToken1PriceResponse { token1_amount })
}

pub fn query_fee(deps: Deps) -> StdResult<FeeResponse> {
    let fees = FEES.load(deps.storage)?;
    let owner = OWNER.load(deps.storage)?.map(|o| o.into_string());

    Ok(FeeResponse {
        owner,
        protocol_fee_percent: fees.protocol_fee_percent,
        protocol_fee_recipient: fees.protocol_fee_recipient.to_string(),
    })
}
