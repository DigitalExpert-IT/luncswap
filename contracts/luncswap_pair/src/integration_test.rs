#![cfg(test)]

use std::{borrow::BorrowMut, str::FromStr};

use cosmwasm_std::{coins, Addr, Decimal, Empty, Uint128};
use cw20::{Cw20Coin, Cw20Contract, Denom};
use cw_multi_test::{App, Contract, ContractWrapper, Executor};

use crate::msg::InstantiateMsg;

fn mock_app() -> App {
    App::default()
}

fn luncswap_factory() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        crate::contract::execute,
        crate::contract::instantiate,
        crate::contract::query,
    );

    Box::new(contract)
}

fn create_luncswap_contract(router: &mut App, owner: &Addr, msg: InstantiateMsg) -> Addr {
    let luncswap_id = router.store_code(luncswap_factory());
    router
        .instantiate_contract(luncswap_id, owner.clone(), &msg, &[], "luncswap", None)
        .unwrap()
}

fn cw20_factory() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        cw20_base::contract::execute,
        cw20_base::contract::instantiate,
        cw20_base::contract::query,
    );

    Box::new(contract)
}

fn create_cw20_contract(
    router: &mut App,
    owner: &Addr,
    name: String,
    symbol: String,
    balance: Uint128,
) -> Cw20Contract {
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
    Cw20Contract(addr)
}

#[test]
fn instantiate() {
    let mut router = mock_app();
    const NATIVE_TOKEN_DENOM: &str = "lunc";

    let owner = Addr::unchecked("owner");
    let funds = coins(2000, NATIVE_TOKEN_DENOM);
    router.borrow_mut().init_modules(|router, _, storage| {
        router.bank.init_balance(storage, &owner, funds).unwrap()
    });

    let cw20_token = create_cw20_contract(
        &mut router,
        &owner,
        "lunc".to_string(),
        "LUNC".to_string(),
        Uint128::new(5000),
    );

    let protocol_fee_percent = Decimal::from_str("0.5").unwrap();
    let luncswap_addr = create_luncswap_contract(
        &mut router,
        &owner,
        InstantiateMsg {
            lp_token_code_id: 0,
            token1_denom: Denom::Native(NATIVE_TOKEN_DENOM.into()),
            token2_denom: Denom::Cw20(cw20_token.addr()),
            owner: Some(owner.to_string()),
            protocol_fee_recipient: owner.to_string(),
            protocol_fee_percent,
        },
    );

    assert_ne!(cw20_token.addr(), luncswap_addr);
}
