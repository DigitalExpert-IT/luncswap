use cosmwasm_std::{Deps, Order, StdResult};
use cw_storage_plus::Bound;

use crate::{
    msg::{PairMsg, PairResponse},
    state::{get_pair_key, PAIRS},
};

pub fn query_pair_list(deps: Deps, start_after: Option<PairMsg>) -> StdResult<Vec<PairResponse>> {
    let start = if let Some(pair_msg) = start_after {
        let mut pair_key = get_pair_key(&[pair_msg.token1, pair_msg.token2]);
        // get key after provided key by appending 1 byte
        pair_key.push(1);
        Some(pair_key)
    } else {
        None
    };

    PAIRS
        .range(
            deps.storage,
            start.map(Bound::ExclusiveRaw),
            None,
            Order::Ascending,
        )
        .take(10)
        .map(|item| -> StdResult<PairResponse> {
            let (_, v) = item?;
            Ok(v.to_pair_response())
        })
        .collect::<StdResult<Vec<PairResponse>>>()
}
