use cosmwasm_std::{Deps, StdResult};
use cw20::Denom;

use crate::{
    msg::PairResponse,
    state::{get_pair_key, PAIRS},
};

pub fn query_pair(deps: Deps, denoms: [Denom; 2]) -> StdResult<Option<PairResponse>> {
    let pair_key = get_pair_key(&denoms);
    match PAIRS.may_load(deps.storage, &pair_key) {
        Ok(o_pair) => {
            if let Some(pair) = o_pair {
                return Ok(Some(pair.to_pair_response()));
            }

            return Ok(None)
        },
        Err(err) => Err(err)
    }
}
