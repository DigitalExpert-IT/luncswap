#![cfg(test)]
use cosmwasm_std::Uint128;
use cw20::Denom;
use cw_multi_test::{App, Executor};

use crate::tests::helper::{create_cw20_contract, instantiate_factory};

#[test]
fn pair_key() {
    let mut router = App::default();
    let (owner_addr, contract_addr) = instantiate_factory(&mut router, "0.5");
    assert_ne!(owner_addr, contract_addr);

    // create cw20
    let (token_a_contract, _) = create_cw20_contract(
        &mut router,
        &owner_addr,
        String::from("token_a"),
        String::from("TOKENA"),
        Uint128::new(0),
    );

    // create new pair
    // token1 -> cw20
    // token2 -> native
    router
        .execute_contract(
            owner_addr.clone(),
            contract_addr.clone(),
            &crate::msg::ExecuteMsg::AddPair {
                token1_denom: Denom::Native("lunc".into()),
                token2_denom: Denom::Cw20(token_a_contract.clone()),
            },
            &vec![],
        )
        .unwrap();

    // make sure it's stored correctly
    let pair: crate::msg::PairResponse = router
        .wrap()
        .query_wasm_smart(
            contract_addr.clone(),
            &crate::msg::QueryMsg::Pair {
                token1: Denom::Native("lunc".into()),
                token2: Denom::Cw20(token_a_contract.clone()),
            },
        )
        .unwrap();

    let pair_info: luncswap_pair::msg::InfoResponse = router
        .wrap()
        .query_wasm_smart(
            pair.contract_address,
            &luncswap_pair::msg::QueryMsg::Info {},
        )
        .unwrap();

    // make sure it's route to the correct contract
    assert_eq!(pair_info.token1_denom, Denom::Native("lunc".into()));
    assert_eq!(
        pair_info.token2_denom,
        Denom::Cw20(token_a_contract.clone())
    );

    // make sure querying using reverse order
    // still produce the same result
    let pair: crate::msg::PairResponse = router
        .wrap()
        .query_wasm_smart(
            contract_addr.clone(),
            &crate::msg::QueryMsg::Pair {
                token2: Denom::Native("lunc".into()),
                token1: Denom::Cw20(token_a_contract.clone()),
            },
        )
        .unwrap();

    let pair_info: luncswap_pair::msg::InfoResponse = router
        .wrap()
        .query_wasm_smart(
            pair.contract_address,
            &luncswap_pair::msg::QueryMsg::Info {},
        )
        .unwrap();

    // make sure it's route to the correct contract
    assert_eq!(pair_info.token1_denom, Denom::Native("lunc".into()));
    assert_eq!(
        pair_info.token2_denom,
        Denom::Cw20(token_a_contract.clone())
    );
}
