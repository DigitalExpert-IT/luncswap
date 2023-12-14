use cosmwasm_std::{Deps, StdResult};
use cw20::Denom;

use crate::{
    msg::PairResponse,
    state::{get_pair_key, Pair, PAIRS},
};

pub fn query_pair(deps: Deps, denoms: [Denom; 2]) -> StdResult<PairResponse> {
    let pair_key = get_pair_key(&denoms);
    let pair: Pair = PAIRS.load(deps.storage, &pair_key)?;
    Ok(pair.to_pair_response())
}
