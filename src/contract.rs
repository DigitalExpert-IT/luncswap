use cosmwasm_std::{Binary, Deps, DepsMut, Empty, Env, MessageInfo, Response, StdResult, Uint128};

use crate::{
    error::ContractError,
    msg::InstantiateMsg,
    state::{Fees, Token, FEES, OWNER, TOKEN1, TOKEN2},
};

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

pub fn query(_deps: Deps, _env: Env, _msg: Empty) -> StdResult<Binary> {
    unimplemented!()
}
