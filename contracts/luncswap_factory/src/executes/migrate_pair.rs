use cosmwasm_std::{to_json_binary, DepsMut, MessageInfo, Response, SubMsg, WasmMsg};
use cw20::Denom;

use crate::{
    error::ContractError,
    state::{get_pair_key, PAIRS},
};

use super::helper::validate_owner;

pub fn execute_migrate_pair(
    deps: DepsMut,
    info: MessageInfo,
    new_code_id: u64,
    token1_denom: Denom,
    token2_denom: Denom,
) -> Result<Response, ContractError> {
    validate_owner(deps.as_ref(), info)?;
    let pair_key = get_pair_key(&[token1_denom.clone(), token2_denom.clone()]);
    let pair = PAIRS.load(deps.storage, &pair_key)?;

    let migrate_msg = WasmMsg::Migrate {
        contract_addr: pair.contract_address.into(),
        new_code_id,
        msg: to_json_binary(&luncswap_pair::msg::MigrateMsg {})?,
    };

    let migrate_msg = SubMsg::new(migrate_msg);

    Ok(Response::new().add_submessage(migrate_msg))
}
