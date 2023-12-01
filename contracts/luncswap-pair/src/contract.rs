use crate::msg::{
    ExecuteMsg, FeeResponse, QueryMsg, Token1ForToken2PriceResponse, Token2ForToken1PriceResponse,
};
use crate::{
    error::ContractError,
    msg::{InfoResponse, InstantiateMsg},
    state::{Fees, Token, FEES, LP_TOKEN, OWNER, TOKEN1, TOKEN2},
};
use cosmwasm_std::{
    attr, to_json_binary, Addr, Binary, Coin, CosmosMsg, Decimal, Deps, DepsMut, Env, MessageInfo,
    Response, StdError, StdResult, SubMsg, Uint128, Uint512, WasmMsg,
};
use cw20::Denom;
use cw20_base::contract::query_balance;

const INSTANTIATE_LP_TOKEN_REPLY_ID: u64 = 0;
const FEE_SCALE_FACTOR: Uint128 = Uint128::new(10_000);
// const MAX_FEE_PERCENT: &str = "1";
const FEE_DECIMAL_PRECISION: Uint128 = Uint128::new(10u128.pow(20));

pub fn instantiate(
    deps: DepsMut,
    env: Env,
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

    let instantiate_lp_token_msg = WasmMsg::Instantiate {
        admin: None,
        code_id: msg.lp_token_code_id,
        msg: to_json_binary(&cw20_base::msg::InstantiateMsg {
            name: "Luncswap_Liquidity_Token".into(),
            symbol: "lslpt".into(),
            decimals: 6,
            initial_balances: vec![],
            marketing: None,
            mint: Some(cw20::MinterResponse {
                minter: env.contract.address.into(),
                cap: None,
            }),
        })?,
        funds: vec![],
        label: "lp_token".to_string(),
    };

    let reply_msg =
        SubMsg::reply_on_success(instantiate_lp_token_msg, INSTANTIATE_LP_TOKEN_REPLY_ID);

    Ok(Response::new().add_submessage(reply_msg))
}

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    use ExecuteMsg::*;

    match msg {
        AddLiquidity {
            token1_amount,
            min_liquidity,
            max_token2,
        } => execute_add_liquidity(deps, &info, env, min_liquidity, token1_amount, max_token2),
        RemoveLiquidity {
            amount: _,
            min_token1: _,
            min_token2: _,
        } => {
            unimplemented!()
        }
        Swap {
            input_token: _,
            input_amount: _,
            min_output: _,
        } => {
            unimplemented!()
        }
    }
}

fn get_amount_for_denom(coins: &[Coin], denom: &str) -> Coin {
    let amount: Uint128 = coins
        .iter()
        .filter(|c| c.denom == denom)
        .map(|c| c.amount)
        .sum();

    Coin {
        amount,
        denom: denom.to_string(),
    }
}

fn validate_input_amount(
    actual_funds: &[Coin],
    given_amount: Uint128,
    given_denom: &Denom,
) -> Result<(), ContractError> {
    match given_denom {
        Denom::Cw20(_) => Ok(()),
        Denom::Native(denom) => {
            let actual = get_amount_for_denom(actual_funds, denom);
            if actual.amount != given_amount {
                return Err(ContractError::InsufficientFunds {});
            }

            if &actual.denom != denom {
                return Err(ContractError::IncorrectNativeDenom {
                    provided: actual.denom,
                    required: denom.to_string(),
                });
            }
            Ok(())
        }
    }
}

fn get_lp_token_supply(deps: Deps, lp_token_addr: &Addr) -> StdResult<Uint128> {
    let resp: cw20::TokenInfoResponse = deps
        .querier
        .query_wasm_smart(lp_token_addr, &cw20_base::msg::QueryMsg::TokenInfo {})?;
    Ok(resp.total_supply)
}

fn get_token2_amount_required(
    max_token: Uint128,
    token1_amount: Uint128,
    liquidity_supply: Uint128,
    token2_reserve: Uint128,
    token1_reserve: Uint128,
) -> Result<Uint128, StdError> {
    if liquidity_supply == Uint128::zero() {
        Ok(max_token)
    } else {
        Ok(token1_amount
            .checked_mul(token2_reserve)
            .map_err(StdError::overflow)?
            .checked_div(token1_reserve)
            .map_err(StdError::divide_by_zero)?
            .checked_add(Uint128::new(1))
            .map_err(StdError::overflow)?)
    }
}

fn get_lp_token_amount_to_mint(
    token1_amount: Uint128,
    liquidity_supply: Uint128,
    token1_reserve: Uint128,
) -> Result<Uint128, ContractError> {
    if liquidity_supply == Uint128::zero() {
        Ok(token1_amount)
    } else {
        Ok(token1_amount
            .checked_mul(liquidity_supply)
            .map_err(StdError::overflow)?
            .checked_div(token1_reserve)
            .map_err(StdError::divide_by_zero)?)
    }
}

fn mint_lp_tokens(
    recipient: &Addr,
    liquidity_amount: Uint128,
    lp_token_address: &Addr,
) -> StdResult<CosmosMsg> {
    let mint_msg = cw20_base::msg::ExecuteMsg::Mint {
        recipient: recipient.to_string(),
        amount: liquidity_amount,
    };

    Ok(WasmMsg::Execute {
        contract_addr: lp_token_address.to_string(),
        msg: to_json_binary(&mint_msg)?,
        funds: vec![],
    }
    .into())
}

pub fn execute_add_liquidity(
    deps: DepsMut,
    info: &MessageInfo,
    _env: Env,
    min_liquidity: Uint128,
    token1_amount: Uint128,
    max_token2: Uint128,
) -> Result<Response, ContractError> {
    let token1 = TOKEN1.load(deps.storage)?;
    let token2 = TOKEN2.load(deps.storage)?;
    let lp_token_addr = LP_TOKEN.load(deps.storage)?;

    validate_input_amount(&info.funds, token1_amount, &token1.denom)?;
    validate_input_amount(&info.funds, max_token2, &token2.denom)?;

    let lp_token_supply = get_lp_token_supply(deps.as_ref(), &lp_token_addr)?;
    let liquidity_amount =
        get_lp_token_amount_to_mint(token1_amount, lp_token_supply, token1.reserve)?;

    let token2_amount = get_token2_amount_required(
        max_token2,
        token1_amount,
        lp_token_supply,
        token2.reserve,
        token1.reserve,
    )?;

    if liquidity_amount < min_liquidity {
        return Err(ContractError::MinLiquidityError {
            provided: liquidity_amount,
            minimum: min_liquidity,
        });
    }

    if token2_amount > max_token2 {
        return Err(ContractError::MaxTokenError {
            provided: token2_amount,
            max: max_token2,
        });
    }

    // TODO: generate msg

    let mint_msg = mint_lp_tokens(&info.sender, liquidity_amount, &lp_token_addr)?;
    Ok(Response::new().add_message(mint_msg).add_attributes(vec![
        attr("token1_amount", token1_amount),
        attr("token2_amount", token2_amount),
        attr("liquidity_received", liquidity_amount),
    ]))
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
