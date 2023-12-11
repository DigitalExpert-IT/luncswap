#![cfg(test)]
use std::str::FromStr;

use cosmwasm_std::{Addr, Decimal, Empty, Uint128};
use cw20::{Cw20Coin, Denom};
use cw_multi_test::{App, Contract, ContractWrapper, Executor};

pub fn luncswap_factory_factory() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        crate::contract::execute,
        crate::contract::instantiate,
        crate::contract::query,
    )
    .with_reply(crate::contract::reply);

    Box::new(contract)
}

pub fn create_luncswap_factory_contract(
    router: &mut App,
    owner: &Addr,
    msg: crate::msg::InstantiateMsg,
) -> (u64, Addr) {
    let id = router.store_code(luncswap_factory_factory());
    let address = router
        .instantiate_contract(id, owner.clone(), &msg, &[], "luncswap_factory", None)
        .unwrap();
    (id, address)
}

pub fn luncswap_pair_factory() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        luncswap_pair::contract::execute,
        luncswap_pair::contract::instantiate,
        luncswap_pair::contract::query,
    )
    .with_reply(luncswap_pair::contract::reply);

    Box::new(contract)
}

fn create_luncswap_pair_contract(
    router: &mut App,
    owner: &Addr,
    msg: luncswap_pair::msg::InstantiateMsg,
) -> (Addr, u64) {
    let luncswap_id = router.store_code(luncswap_pair_factory());
    let address = router
        .instantiate_contract(luncswap_id, owner.clone(), &msg, &[], "luncswap", None)
        .unwrap();

    (address, luncswap_id)
}

pub fn cw20_factory() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        cw20_base::contract::execute,
        cw20_base::contract::instantiate,
        cw20_base::contract::query,
    );

    Box::new(contract)
}

pub fn create_cw20_contract(
    router: &mut App,
    owner: &Addr,
    name: String,
    symbol: String,
    balance: Uint128,
) -> (Addr, u64) {
    let cw20_id = router.store_code(cw20_factory());
    let msg = cw20_base::msg::InstantiateMsg {
        name,
        symbol: symbol.clone(),
        decimals: 6,
        initial_balances: vec![Cw20Coin {
            address: owner.to_string(),
            amount: balance,
        }],
        mint: None,
        marketing: None,
    };
    let addr = router
        .instantiate_contract(cw20_id, owner.clone(), &msg, &[], symbol, None)
        .unwrap();
    (addr, cw20_id)
}

// get cw20 balance
// pub fn get_token_balance(owner: &Addr, contract: &Addr, app: &App) -> cw20::BalanceResponse {
//     app.wrap()
//         .query_wasm_smart(
//             contract,
//             &cw20_base::msg::QueryMsg::Balance {
//                 address: owner.into(),
//             },
//         )
//         .unwrap()
// }

// // get native balance
// pub fn get_native_balance(owner: &Addr, app: &App) -> Coin {
//     app.wrap().query_balance(owner, "lunc").unwrap()
// }

// pub fn transfer_cw20(
//     owner: &Addr,
//     receiver: &Addr,
//     amount: &Uint128,
//     contract_address: &Addr,
//     app: &mut App,
// ) -> cw20::BalanceResponse {
//     app.execute_contract(
//         owner.clone(),
//         contract_address.clone(),
//         &cw20_base::msg::ExecuteMsg::Transfer {
//             recipient: receiver.into(),
//             amount: *amount,
//         },
//         &vec![],
//     )
//     .unwrap();
//     get_token_balance(receiver, contract_address, app)
// }

pub fn instantiate_factory<'a>(router: &'a mut App, protocol_fee_percent: &str) -> (Addr, Addr) {
    const NATIVE_TOKEN_DENOM: &str = "lunc";

    let owner = Addr::unchecked("owner");

    let (cw20_token, cw20_code_id) = create_cw20_contract(
        router,
        &owner,
        "lunct".to_string(),
        "LUNCT".to_string(),
        Uint128::new(0),
    );

    let protocol_fee_percent = Decimal::from_str(protocol_fee_percent).unwrap();
    let (_, pair_id) = create_luncswap_pair_contract(
        router,
        &owner,
        luncswap_pair::msg::InstantiateMsg {
            lp_token_code_id: cw20_code_id,
            token1_denom: Denom::Native(NATIVE_TOKEN_DENOM.into()),
            token2_denom: Denom::Cw20(cw20_token.clone()),
            owner: Some(owner.to_string()),
            protocol_fee_recipient: owner.to_string(),
            protocol_fee_percent: protocol_fee_percent.clone(),
        },
    );

    let (_, factory_contract) = create_luncswap_factory_contract(
        router,
        &owner,
        crate::msg::InstantiateMsg {
            lp_token_code_id: cw20_code_id,
            pair_code_id: pair_id,
            protocol_fee_recipient: owner.to_string(),
            protocol_fee_percent,
        },
    );

    (owner, factory_contract)
}