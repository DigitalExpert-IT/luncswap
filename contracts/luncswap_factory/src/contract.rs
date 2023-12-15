use cosmwasm_std::{
    to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, QueryRequest, Reply, Response,
    StdError, StdResult, WasmQuery,
};
use cw0::parse_reply_instantiate_data;
use cw2::{get_contract_version, set_contract_version};
use semver::Version;

use crate::{
    error::ContractError,
    executes::{add_pair::execute_add_pair, migrate_pair::execute_migrate_pair},
    msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg},
    queries::{pair::query_pair, pair_list::query_pair_list},
    state::{get_pair_key, Config, Pair, CONFIG, INSTANTIATE_PAIR_REPLY_ID, PAIRS},
};

const CONTRACT_NAME: &str = env!("CARGO_PKG_NAME");
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

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
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    Ok(Response::new())
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

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    use ExecuteMsg::*;

    match msg {
        AddPair {
            token1_denom,
            token2_denom,
        } => {
            let config = CONFIG.load(deps.storage)?;
            execute_add_pair(
                deps,
                env,
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
        MigratePair {
            new_code_id,
            token1_denom,
            token2_denom,
        } => execute_migrate_pair(deps, info, new_code_id, token1_denom, token2_denom),
    }
}

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    use QueryMsg::*;

    match msg {
        Pair { token1, token2 } => to_json_binary(&query_pair(deps, [token1, token2])?),
        PairList { after } => to_json_binary(&query_pair_list(deps, after)?),
    }
}
