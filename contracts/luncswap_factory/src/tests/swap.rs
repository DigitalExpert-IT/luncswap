#![cfg(test)]
use cosmwasm_std::{coins, Addr, Uint128};
use cw20::Denom;
use cw_multi_test::{App, Executor};
use cwhelper::human_value;

use crate::tests::helper::{
    create_cw20_contract, faucet, get_native_balance, get_token_balance, increase_allowance,
    instantiate_factory,
};

#[test]
fn swap() {
    let mut router = App::default();
    let (owner_addr, contract_addr) = instantiate_factory(&mut router, "0");
    assert_ne!(owner_addr, contract_addr);

    // create cw20
    let (token_a_contract, _) = create_cw20_contract(
        &mut router,
        &owner_addr,
        String::from("token_a"),
        String::from("TOKENA"),
        cwhelper::human_value("1_000_000_000", Some(6)),
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
    let pair_contract_addr = Addr::unchecked(pair.contract_address);

    // increase allowance
    increase_allowance(
        &mut router,
        owner_addr.clone(),
        token_a_contract.clone(),
        pair_contract_addr.clone(),
        human_value("50_000", Some(6)),
    )
    .unwrap();

    // initiate balance
    faucet(
        &mut router,
        vec![(owner_addr.clone(), human_value("50_000", Some(6)))],
    )
    .unwrap();

    // add liquidity
    router
        .execute_contract(
            owner_addr.clone(),
            pair_contract_addr.clone(),
            &luncswap_pair::msg::ExecuteMsg::AddLiquidity {
                token1_amount: human_value("50_000", Some(6)),
                min_liquidity: Uint128::zero(),
                max_token2: human_value("50_000", Some(6)),
            },
            &coins(human_value("50_000", Some(6)).into(), "lunc"),
        )
        .unwrap();

    // make sure token balance decreased
    let token_balance = get_token_balance(&router, &owner_addr, &token_a_contract).balance;
    assert_eq!(
        human_value("1_000_000_000", Some(6))
            .checked_sub(human_value("50_000", Some(6)))
            .unwrap(),
        token_balance
    );

    // make sure native balance decreased
    let native_balance = get_native_balance(&router, &owner_addr).amount;
    assert_eq!(native_balance, Uint128::zero());

    // increase allowance
    increase_allowance(
        &mut router,
        owner_addr.clone(),
        token_a_contract.clone(),
        pair_contract_addr.clone(),
        human_value("7000", Some(6)),
    )
    .unwrap();

    // swap token 2 for token 1
    router
        .execute_contract(
            owner_addr.clone(),
            pair_contract_addr.clone(),
            &luncswap_pair::msg::ExecuteMsg::Swap {
                input_token: luncswap_pair::msg::TokenSelect::Token2,
                input_amount: human_value("7000", Some(6)),
                min_output: Uint128::zero(),
            },
            &vec![],
        )
        .unwrap();
    let native_balance = get_native_balance(&router, &owner_addr).amount;
    // the balance rn should be 6140.350877192985
    assert_eq!(native_balance, human_value("6140.350877192985", Some(6)));
}
