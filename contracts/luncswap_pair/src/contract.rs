use crate::msg::{
    ExecuteMsg, FeeResponse, MigrateMsg, QueryMsg, Token1ForToken2PriceResponse,
    Token2ForToken1PriceResponse, TokenSelect,
};
use crate::{
    error::ContractError,
    msg::{InfoResponse, InstantiateMsg},
    state::{Fees, Token, FEES, LP_TOKEN, OWNER, TOKEN1, TOKEN2},
};
use cosmwasm_std::{
    attr, to_json_binary, Addr, Binary, BlockInfo, Coin, CosmosMsg, Decimal, Deps, DepsMut, Env,
    MessageInfo, Reply, Response, StdError, StdResult, SubMsg, Uint128, Uint256, Uint512, WasmMsg,
};
use cw0::parse_reply_instantiate_data;
use cw2::{get_contract_version, set_contract_version};
use cw20::{Cw20ExecuteMsg, Denom, Expiration};
use cw20_base::contract::query_balance;
use semver::Version;

const INSTANTIATE_LP_TOKEN_REPLY_ID: u64 = 0;
const FEE_SCALE_FACTOR: Uint128 = Uint128::new(10_000);
const FEE_DECIMAL_PRECISION: Uint128 = Uint128::new(10u128.pow(20));
const CONTRACT_NAME: &str = env!("CARGO_PKG_NAME");
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> Result<Response, ContractError> {
    if msg.id != INSTANTIATE_LP_TOKEN_REPLY_ID {
        return Err(ContractError::UnknownReplyId { id: msg.id });
    };
    let res = parse_reply_instantiate_data(msg);
    match res {
        Ok(res) => {
            // Validate contract address
            let cw20_addr = deps.api.addr_validate(&res.contract_address)?;

            // Save gov token
            LP_TOKEN.save(deps.storage, &cw20_addr)?;

            Ok(Response::new())
        }
        Err(_) => Err(ContractError::InstantiateLpTokenError {}),
    }
}

pub fn migrate(deps: DepsMut, _env: Env, _msg: MigrateMsg) -> Result<Response, ContractError> {
    let version: Version = CONTRACT_VERSION.parse()?;
    let storage_version: Version = get_contract_version(deps.storage)?.version.parse()?;
    let storage_name = get_contract_version(deps.storage)?.contract;

    if CONTRACT_NAME != storage_name {
        return Err(StdError::generic_err("Can only upgrade from same contract type").into());
    }

    if storage_version < version {
        set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    } else {
        return Err(StdError::generic_err("Cannot upgrade from a newer contract version").into());
    }

    Ok(Response::default())
}

pub fn instantiate(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    if msg.token1_denom == msg.token2_denom {
        return Err(ContractError::InvalidPairInitiation {});
    }

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
            symbol: "lswpt".into(),
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
            amount,
            min_token1,
            min_token2,
        } => execute_remove_liquidity(deps, info, amount, min_token1, min_token2),
        Swap {
            input_token,
            input_amount,
            min_output,
        } => execute_swap(
            deps,
            &info,
            input_amount,
            env,
            input_token,
            info.sender.to_string(),
            min_output,
            None,
        ),
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

pub fn execute_remove_liquidity(
    deps: DepsMut,
    info: MessageInfo,
    amount: Uint128,
    min_token1: Uint128,
    min_token2: Uint128,
) -> Result<Response, ContractError> {
    let lp_token_addr = LP_TOKEN.load(deps.storage)?;
    let token1 = TOKEN1.load(deps.storage)?;
    let token2 = TOKEN2.load(deps.storage)?;
    let lp_token_balance: cw20::BalanceResponse = deps.querier.query_wasm_smart(
        &lp_token_addr,
        &cw20_base::msg::QueryMsg::Balance {
            address: info.sender.clone().to_string(),
        },
    )?;

    let lp_token_info: cw20::TokenInfoResponse = deps
        .querier
        .query_wasm_smart(&lp_token_addr, &cw20_base::msg::QueryMsg::TokenInfo {})?;

    if amount > lp_token_balance.balance {
        return Err(ContractError::InsufficientLiquidityError {
            requested: amount,
            available: lp_token_balance.balance,
        });
    }

    let token1_amount = amount
        .checked_mul(token1.reserve)
        .map_err(StdError::overflow)?
        .checked_div(lp_token_info.total_supply)
        .map_err(StdError::divide_by_zero)?;

    if token1_amount < min_token1 {
        return Err(ContractError::MinToken1Error {
            requested: min_token1,
            available: token1_amount,
        });
    }

    let token2_amount = amount
        .checked_mul(token2.reserve)
        .map_err(StdError::overflow)?
        .checked_div(lp_token_info.total_supply)
        .map_err(StdError::divide_by_zero)?;

    if token2_amount < min_token2 {
        return Err(ContractError::MinToken1Error {
            requested: min_token2,
            available: token2_amount,
        });
    }

    TOKEN1.update(deps.storage, |mut token1| -> Result<_, ContractError> {
        token1.reserve = token1
            .reserve
            .checked_sub(token1_amount)
            .map_err(StdError::overflow)?;
        Ok(token1)
    })?;

    TOKEN2.update(deps.storage, |mut token2| -> Result<_, ContractError> {
        token2.reserve = token2
            .reserve
            .checked_sub(token2_amount)
            .map_err(StdError::overflow)?;
        Ok(token2)
    })?;

    let token1_transfer_msg = match token1.denom {
        Denom::Cw20(addr) => get_cw20_transfer_to_msg(&info.sender.clone(), &addr, token1_amount)?,
        Denom::Native(denom) => get_bank_transfer_to_msg(&info.sender, &denom, token1_amount),
    };

    let token2_transfer_msg = match token2.denom {
        Denom::Cw20(addr) => get_cw20_transfer_to_msg(&info.sender, &addr, token2_amount)?,
        Denom::Native(denom) => get_bank_transfer_to_msg(&info.sender, &denom, token2_amount),
    };

    let lp_token_burn_msg: CosmosMsg = WasmMsg::Execute {
        contract_addr: lp_token_addr.into(),
        msg: to_json_binary(&cw20_base::msg::ExecuteMsg::BurnFrom {
            owner: info.sender.into(),
            amount,
        })?,
        funds: vec![],
    }
    .into();

    Ok(Response::new()
        .add_messages(vec![
            token1_transfer_msg,
            token2_transfer_msg,
            lp_token_burn_msg,
        ])
        .add_attributes(vec![
            attr("token1_returned", token1_amount),
            attr("token2_returned", token2_amount),
            attr("liquidity_burned", amount),
        ]))
}

pub fn execute_add_liquidity(
    deps: DepsMut,
    info: &MessageInfo,
    env: Env,
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

    let mut transfer_msgs: Vec<CosmosMsg> = vec![];
    if let cw20::Denom::Cw20(addr) = token1.denom {
        transfer_msgs.push(get_cw20_transfer_from_msg(
            &info.sender,
            &env.contract.address,
            &addr,
            token1_amount,
        )?)
    }

    // Refund token 2 if is a native token and not all is spent
    if let Denom::Native(denom) = token2.denom.clone() {
        if token2_amount < max_token2 {
            transfer_msgs.push(get_bank_transfer_to_msg(
                &info.sender,
                &denom,
                max_token2 - token2_amount,
            ))
        }
    }

    if let Denom::Cw20(addr) = token2.denom {
        transfer_msgs.push(get_cw20_transfer_from_msg(
            &info.sender,
            &env.contract.address,
            &addr,
            token2_amount,
        )?)
    }

    TOKEN1.update(deps.storage, |mut token1| -> Result<_, ContractError> {
        token1.reserve += token1_amount;
        Ok(token1)
    })?;

    TOKEN2.update(deps.storage, |mut token2| -> Result<_, ContractError> {
        token2.reserve += token2_amount;
        Ok(token2)
    })?;

    let mint_msg = mint_lp_tokens(&info.sender, liquidity_amount, &lp_token_addr)?;
    Ok(Response::new()
        .add_messages(transfer_msgs)
        .add_message(mint_msg)
        .add_attributes(vec![
            attr("token1_amount", token1_amount),
            attr("token2_amount", token2_amount),
            attr("liquidity_received", liquidity_amount),
        ]))
}

#[allow(clippy::too_many_arguments)]
pub fn execute_swap(
    deps: DepsMut,
    info: &MessageInfo,
    input_amount: Uint128,
    env: Env,
    input_token_enum: TokenSelect,
    recipient: String,
    min_token: Uint128,
    expiration: Option<Expiration>,
) -> Result<Response, ContractError> {
    check_expiration(&expiration, &env.block)?;

    let input_token_item = match input_token_enum {
        TokenSelect::Token1 => TOKEN1,
        TokenSelect::Token2 => TOKEN2,
    };
    let input_token = input_token_item.load(deps.storage)?;
    let output_token_item = match input_token_enum {
        TokenSelect::Token1 => TOKEN2,
        TokenSelect::Token2 => TOKEN1,
    };
    let output_token = output_token_item.load(deps.storage)?;

    // validate price impact, max impact are 20%
    let price_impact = 1_f64
        - f64::sqrt(
            1_f64
                - input_amount.to_string().parse::<f64>().unwrap()
                    / input_token.reserve.to_string().parse::<f64>().unwrap(),
        );
    if price_impact > 0.2_f64 {
        return Err(ContractError::PriceImpactTooHigh{});
    }

    // validate input_amount if native input token
    validate_input_amount(&info.funds, input_amount, &input_token.denom)?;

    let fees = FEES.load(deps.storage)?;
    let total_fee_percent = fees.protocol_fee_percent;
    let token_bought = get_input_price(
        input_amount,
        input_token.reserve,
        output_token.reserve,
        total_fee_percent,
    )?;

    if min_token > token_bought {
        return Err(ContractError::SwapMinError {
            min: min_token,
            available: token_bought,
        });
    }
    // Calculate fees
    let protocol_fee_amount = get_protocol_fee_amount(input_amount, fees.protocol_fee_percent)?;
    let input_amount_minus_protocol_fee = input_amount - protocol_fee_amount;

    let mut msgs = match input_token.denom.clone() {
        Denom::Cw20(addr) => vec![get_cw20_transfer_from_msg(
            &info.sender,
            &env.contract.address,
            &addr,
            input_amount_minus_protocol_fee,
        )?],
        Denom::Native(_) => vec![],
    };

    // Send protocol fee to protocol fee recipient
    if !protocol_fee_amount.is_zero() {
        msgs.push(get_fee_transfer_msg(
            &info.sender,
            &fees.protocol_fee_recipient,
            &input_token.denom,
            protocol_fee_amount,
        )?)
    }

    let recipient = deps.api.addr_validate(&recipient)?;
    // Create transfer to message
    msgs.push(match output_token.denom {
        Denom::Cw20(addr) => get_cw20_transfer_to_msg(&recipient, &addr, token_bought)?,
        Denom::Native(denom) => get_bank_transfer_to_msg(&recipient, &denom, token_bought),
    });

    input_token_item.update(
        deps.storage,
        |mut input_token| -> Result<_, ContractError> {
            input_token.reserve = input_token
                .reserve
                .checked_add(input_amount_minus_protocol_fee)
                .map_err(StdError::overflow)?;
            Ok(input_token)
        },
    )?;

    output_token_item.update(
        deps.storage,
        |mut output_token| -> Result<_, ContractError> {
            output_token.reserve = output_token
                .reserve
                .checked_sub(token_bought)
                .map_err(StdError::overflow)?;
            Ok(output_token)
        },
    )?;

    Ok(Response::new().add_messages(msgs).add_attributes(vec![
        attr("native_sold", input_amount),
        attr("token_bought", token_bought),
    ]))
}

fn get_cw20_transfer_to_msg(
    recipient: &Addr,
    token_addr: &Addr,
    token_amount: Uint128,
) -> StdResult<CosmosMsg> {
    // create transfer cw20 msg
    let transfer_cw20_msg = Cw20ExecuteMsg::Transfer {
        recipient: recipient.into(),
        amount: token_amount,
    };
    let exec_cw20_transfer = WasmMsg::Execute {
        contract_addr: token_addr.into(),
        msg: to_json_binary(&transfer_cw20_msg)?,
        funds: vec![],
    };
    let cw20_transfer_cosmos_msg: CosmosMsg = exec_cw20_transfer.into();
    Ok(cw20_transfer_cosmos_msg)
}

fn get_protocol_fee_amount(input_amount: Uint128, fee_percent: Decimal) -> StdResult<Uint128> {
    if fee_percent.is_zero() {
        return Ok(Uint128::zero());
    }

    let fee_percent = fee_decimal_to_uint128(fee_percent)?;
    Ok(input_amount
        .full_mul(fee_percent)
        .checked_div(Uint256::from(FEE_SCALE_FACTOR))
        .map_err(StdError::divide_by_zero)?
        .try_into()?)
}

fn get_fee_transfer_msg(
    sender: &Addr,
    recipient: &Addr,
    fee_denom: &Denom,
    amount: Uint128,
) -> StdResult<CosmosMsg> {
    match fee_denom {
        Denom::Cw20(addr) => get_cw20_transfer_from_msg(sender, recipient, addr, amount),
        Denom::Native(denom) => Ok(get_bank_transfer_to_msg(recipient, denom, amount)),
    }
}

fn check_expiration(
    expiration: &Option<Expiration>,
    block: &BlockInfo,
) -> Result<(), ContractError> {
    match expiration {
        Some(e) => {
            if e.is_expired(block) {
                return Err(ContractError::MsgExpirationError {});
            }
            Ok(())
        }
        None => Ok(()),
    }
}

fn get_bank_transfer_to_msg(recipient: &Addr, denom: &str, native_amount: Uint128) -> CosmosMsg {
    let transfer_bank_msg = cosmwasm_std::BankMsg::Send {
        to_address: recipient.into(),
        amount: vec![Coin {
            denom: denom.to_string(),
            amount: native_amount,
        }],
    };

    let transfer_bank_cosmos_msg: CosmosMsg = transfer_bank_msg.into();
    transfer_bank_cosmos_msg
}

fn get_cw20_transfer_from_msg(
    owner: &Addr,
    recipient: &Addr,
    token_addr: &Addr,
    token_amount: Uint128,
) -> StdResult<CosmosMsg> {
    // create transfer cw20 msg
    let transfer_cw20_msg = Cw20ExecuteMsg::TransferFrom {
        owner: owner.into(),
        recipient: recipient.into(),
        amount: token_amount,
    };
    let exec_cw20_transfer = WasmMsg::Execute {
        contract_addr: token_addr.into(),
        msg: to_json_binary(&transfer_cw20_msg)?,
        funds: vec![],
    };
    let cw20_transfer_cosmos_msg: CosmosMsg = exec_cw20_transfer.into();
    Ok(cw20_transfer_cosmos_msg)
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
    let lp_token = LP_TOKEN.load(deps.storage)?;

    Ok(InfoResponse {
        token1_reserve: token1.reserve,
        token1_denom: token1.denom,
        token2_reserve: token2.reserve,
        token2_denom: token2.denom,
        lp_token_address: lp_token,
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
        return Err(StdError::GenericErr {
            msg: "No Liquidity".into(),
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
