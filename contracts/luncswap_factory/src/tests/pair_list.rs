#![cfg(test)]
use cosmwasm_std::Uint128;
use cw20::Denom;
use cw_multi_test::{App, Executor};

use crate::{
    msg::PairResponse,
    tests::helper::{create_cw20_contract, instantiate_factory},
};

#[test]
fn pair_list() {
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
    let (token_b_contract, _) = create_cw20_contract(
        &mut router,
        &owner_addr,
        String::from("token_b"),
        String::from("TOKENB"),
        Uint128::new(0),
    );
    let (token_c_contract, _) = create_cw20_contract(
        &mut router,
        &owner_addr,
        String::from("token_c"),
        String::from("TOKENC"),
        Uint128::new(0),
    );

    let pair_list_input: Vec<[Denom; 2]> = vec![
        // native -> a
        [
            Denom::Native("lunc".into()),
            Denom::Cw20(token_a_contract.clone()),
        ],
        // native -> b
        [
            Denom::Native("lunc".into()),
            Denom::Cw20(token_b_contract.clone()),
        ],
        // native -> c
        [
            Denom::Native("lunc".into()),
            Denom::Cw20(token_c_contract.clone()),
        ],
        // a -> b
        [
            Denom::Cw20(token_a_contract.clone()),
            Denom::Cw20(token_b_contract.clone()),
        ],
    ];

    for pair in pair_list_input.iter() {
        router
            .execute_contract(
                owner_addr.clone(),
                contract_addr.clone(),
                &crate::msg::ExecuteMsg::AddPair {
                    token1_denom: pair[0].clone(),
                    token2_denom: pair[1].clone(),
                },
                &vec![],
            )
            .unwrap();
    }

    let all_pair_list: Vec<PairResponse> = router
        .wrap()
        .query_wasm_smart(
            contract_addr.clone(),
            &crate::msg::QueryMsg::PairList { after: None },
        )
        .unwrap();

    assert_eq!(all_pair_list.len(), 4);

    let paginated_pair_list: Vec<PairResponse> = router
        .wrap()
        .query_wasm_smart(
            contract_addr.clone(),
            &crate::msg::QueryMsg::PairList {
                after: Some(crate::msg::PairMsg {
                    token1: pair_list_input[3][0].clone(),
                    token2: pair_list_input[3][1].clone(),
                }),
            },
        )
        .unwrap();

    assert_eq!(paginated_pair_list.len(), 3);
}
