use cosmwasm_std::{
    to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, QueryRequest, Reply, Response,
    StdResult, SubMsg, WasmMsg, WasmQuery,
};
use cw0::parse_reply_instantiate_data;
use cw20::Denom;

use crate::{
    error::ContractError,
    msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, PairResponse, QueryMsg},
    queries::pair_list::query_pair_list,
    state::{get_pair_key, Config, Pair, CONFIG, PAIRS},
};

const INSTANTIATE_PAIR_REPLY_ID: u64 = 0;

pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> Result<Response, ContractError> {
    if msg.id != INSTANTIATE_PAIR_REPLY_ID {
        return Err(ContractError::InvalidReply { code: msg.id });
    }

    let res = parse_reply_instantiate_data(msg);
    match res {
        Ok(res) => {
            use luncswap_pair::msg::*;
            let contract_address = deps.api.addr_validate(&res.contract_address)?;
            let query_msg: QueryMsg = QueryMsg::Info {};
            let query_response: InfoResponse =
                deps.querier.query(&QueryRequest::Wasm(WasmQuery::Smart {
                    contract_addr: contract_address.clone().into(),
                    msg: to_json_binary(&query_msg)?,
                }))?;

            let pair_key = get_pair_key(&[
                query_response.token1_denom.clone(),
                query_response.token2_denom.clone(),
            ]);

            PAIRS.save(
                deps.storage,
                &pair_key.clone(),
                &Pair {
                    pair_key,
                    contract_address,
                    assets: [query_response.token1_denom, query_response.token2_denom],
                    lp_token_address: query_response.lp_token_address,
                },
            )?;

            Ok(Response::new())
        }
        Err(_) => Ok(Response::new()),
    }
}

pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
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

pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
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
    let pair_key = get_pair_key(&[msg.token1_denom.clone(), msg.token2_denom.clone()]);

    if let Some(_) = PAIRS.may_load(deps.storage, &pair_key)? {
        return Err(cosmwasm_std::StdError::GenericErr {
            msg: "Duplicate pair".into(),
        });
    }

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
        PairList { after } => to_json_binary(&query_pair_list(deps, after)?),
    }
}

fn query_pair(deps: Deps, denoms: [Denom; 2]) -> StdResult<PairResponse> {
    let pair_key = get_pair_key(&denoms);
    let pair: Pair = PAIRS.load(deps.storage, &pair_key)?;
    Ok(pair.to_pair_response())
}
