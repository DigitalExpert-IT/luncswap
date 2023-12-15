use cosmwasm_std::{to_json_binary, DepsMut, Env, Response, SubMsg, WasmMsg};

use crate::{
    error::ContractError,
    state::{get_pair_key, CONFIG, INSTANTIATE_PAIR_REPLY_ID, PAIRS},
};

pub fn execute_add_pair(
    deps: DepsMut,
    env: Env,
    msg: luncswap_pair::msg::InstantiateMsg,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    let pair_key = get_pair_key(&[msg.token1_denom.clone(), msg.token2_denom.clone()]);

    if let Some(_) = PAIRS.may_load(deps.storage, &pair_key)? {
        return Err(cosmwasm_std::StdError::GenericErr {
            msg: "Duplicate pair".into(),
        }
        .into());
    }

    let instantiate_pair_msg = WasmMsg::Instantiate {
        admin: Some(env.contract.address.to_string()),
        code_id: config.pair_code_id,
        msg: to_json_binary(&msg)?,
        funds: vec![],
        label: "pair".to_string(),
    };

    let reply_msg = SubMsg::reply_on_success(instantiate_pair_msg, INSTANTIATE_PAIR_REPLY_ID);

    Ok(Response::new().add_submessage(reply_msg))
}
