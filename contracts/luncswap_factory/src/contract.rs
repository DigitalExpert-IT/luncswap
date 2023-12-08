use cosmwasm_std::{
    to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Reply, Response, StdResult, SubMsg,
    WasmMsg,
};
use cw0::parse_reply_instantiate_data;
use cw20::Denom;

use crate::{
    msg::{ExecuteMsg, InstantiateMsg, PairResponse, QueryMsg},
    state::{get_pair_key, Config, Pair, CONFIG, PAIRS},
};

const INSTANTIATE_PAIR_REPLY_ID: u64 = 0;

pub fn reply(_deps: DepsMut, _env: Env, msg: Reply) -> StdResult<Response> {
    if msg.id != INSTANTIATE_PAIR_REPLY_ID {
        return Err(cosmwasm_std::StdError::GenericErr {
            msg: "unknown reply code".into(),
        });
    }

    let res = parse_reply_instantiate_data(msg);
    match res {
        Ok(_) => Ok(Response::new()),
        Err(_) => Ok(Response::new()),
    }
}

pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let config = Config {
        owner: deps.api.addr_canonicalize(info.sender.as_str())?,
        pair_code_id: msg.pair_code_id,
        lp_token_code_id: msg.lp_token_code_id,
        protocol_fee_recipient: msg.protocol_fee_recipient,
        protocol_fee_percent: msg.protocol_fee_percent,
    };

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new())
}

pub fn execute(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    use ExecuteMsg::*;

    match msg {
        AddPair {
            token1_denom,
            token2_denom,
        } => {
            let config = CONFIG.load(deps.storage)?;
            execute_add_pair(
                deps,
                luncswap_pair::msg::InstantiateMsg {
                    token1_denom,
                    token2_denom,
                    owner: None,
                    protocol_fee_recipient: config.protocol_fee_recipient,
                    protocol_fee_percent: config.protocol_fee_percent,
                    lp_token_code_id: config.lp_token_code_id,
                },
            )
        }
    }
}

fn execute_add_pair(deps: DepsMut, msg: luncswap_pair::msg::InstantiateMsg) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;

    let instantiate_pair_msg = WasmMsg::Instantiate {
        admin: None,
        code_id: config.pair_code_id,
        msg: to_json_binary(&msg)?,
        funds: vec![],
        label: "pair".to_string(),
    };

    let reply_msg = SubMsg::reply_on_success(instantiate_pair_msg, INSTANTIATE_PAIR_REPLY_ID);

    Ok(Response::new().add_submessage(reply_msg))
}

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    use QueryMsg::*;

    match msg {
        Pair { token1, token2 } => to_json_binary(&query_pair(deps, [token1, token2])?),
    }
}

fn query_pair(deps: Deps, denoms: [Denom; 2]) -> StdResult<PairResponse> {
    let pair_key = get_pair_key(&denoms);
    let pair: Pair = PAIRS.load(deps.storage, &pair_key)?;

    Ok(PairResponse {
        contract_address: pair.contract_address,
        lp_address: pair.lp_address,
    })
}
