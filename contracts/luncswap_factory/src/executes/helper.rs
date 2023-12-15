use cosmwasm_std::{Deps, MessageInfo};

use crate::{error::ContractError, state::CONFIG};

pub fn validate_owner(deps: Deps, info: MessageInfo) -> Result<(), ContractError> {
    let config = CONFIG.load(deps.storage)?;
    let owner = deps.api.addr_canonicalize(info.sender.as_str())?;
    if config.owner != owner {
        return Err(ContractError::Unauthorized {});
    }
    Ok(())
}
