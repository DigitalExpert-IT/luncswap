#![cfg(test)]
use std::{borrow::BorrowMut, str::FromStr};

use cosmwasm_std::{coins, Addr, Coin, Decimal, Empty, Uint128};
use cw20::{Cw20Coin, Denom};
use cw_multi_test::{App, Contract, ContractWrapper, Executor};

fn mock_app() -> App {
    App::default()
}

fn luncswap_factory_factory() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        crate::contract::execute,
        crate::contract::instantiate,
        crate::contract::query,
    )
    .with_reply(crate::contract::reply);

    Box::new(contract)
}

fn create_luncswap_factory_contract(
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

fn luncswap_pair_factory() -> Box<dyn Contract<Empty>> {
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
fn get_token_balance(owner: &Addr, contract: &Addr, app: &App) -> cw20::BalanceResponse {
    app.wrap()
        .query_wasm_smart(
            contract,
            &cw20_base::msg::QueryMsg::Balance {
                address: owner.into(),
            },
        )
        .unwrap()
}

// get native balance
fn get_native_balance(owner: &Addr, app: &App) -> Coin {
    app.wrap().query_balance(owner, "lunc").unwrap()
}

fn transfer_cw20(
    owner: &Addr,
    receiver: &Addr,
    amount: &Uint128,
    contract_address: &Addr,
    app: &mut App,
) -> cw20::BalanceResponse {
    app.execute_contract(
        owner.clone(),
        contract_address.clone(),
        &cw20_base::msg::ExecuteMsg::Transfer {
            recipient: receiver.into(),
            amount: *amount,
        },
        &vec![],
    )
    .unwrap();
    get_token_balance(receiver, contract_address, app)
}

#[test]
fn instantiate() {
    let mut router = mock_app();
    const NATIVE_TOKEN_DENOM: &str = "lunc";

    let owner = Addr::unchecked("owner");
    let swapper = Addr::unchecked("swapper");
    let funds = coins(1000, NATIVE_TOKEN_DENOM);

    router.borrow_mut().init_modules(|router, _, storage| {
        router.bank.init_balance(storage, &owner, funds).unwrap();
        router
            .bank
            .init_balance(storage, &swapper, coins(10, NATIVE_TOKEN_DENOM))
            .unwrap()
    });

    const INITIAL_TOKEN_BALANCE: Uint128 = Uint128::new(1000000000);
    let (cw20_token, cw20_code_id) = create_cw20_contract(
        &mut router,
        &owner,
        "lunct".to_string(),
        "LUNCT".to_string(),
        INITIAL_TOKEN_BALANCE,
    );
    let swapper_token_balance = transfer_cw20(
        &owner,
        &swapper,
        &Uint128::new(1000),
        &cw20_token,
        &mut router,
    );

    assert_eq!(swapper_token_balance.balance, Uint128::new(1000));

    let protocol_fee_percent = Decimal::from_str("0.5").unwrap();
    let (_, pair_id) = create_luncswap_pair_contract(
        &mut router,
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
        &mut router,
        &owner,
        crate::msg::InstantiateMsg {
            lp_token_code_id: cw20_code_id,
            pair_code_id: pair_id,
            protocol_fee_recipient: owner.to_string(),
            protocol_fee_percent,
        },
    );

    router
        .execute_contract(
            owner.clone(),
            Addr::unchecked(&factory_contract),
            &crate::msg::ExecuteMsg::AddPair {
                token1_denom: Denom::Native(NATIVE_TOKEN_DENOM.into()),
                token2_denom: Denom::Cw20(Addr::unchecked(&cw20_token)),
            },
            &vec![],
        )
        .unwrap();

    // query newly created pair
    let pair: crate::msg::PairResponse = router
        .wrap()
        .query_wasm_smart(
            &factory_contract,
            &crate::msg::QueryMsg::Pair {
                token1: Denom::Native(NATIVE_TOKEN_DENOM.into()),
                token2: Denom::Cw20(Addr::unchecked(&cw20_token)),
            },
        )
        .unwrap();

    // check pair reserve, expect 0
    let pair_info: luncswap_pair::msg::InfoResponse = router
        .wrap()
        .query_wasm_smart(
            &pair.contract_address,
            &luncswap_pair::msg::QueryMsg::Info {},
        )
        .unwrap();

    let total_reserve = pair_info
        .token1_reserve
        .checked_add(pair_info.token2_reserve)
        .unwrap();

    assert_eq!(total_reserve, Uint128::new(0));

    // increase allowance before adding liquidity
    router
        .execute_contract(
            owner.clone(),
            cw20_token.clone(),
            &cw20_base::msg::ExecuteMsg::IncreaseAllowance {
                spender: pair.contract_address.clone().into(),
                amount: Uint128::from_str("1000").unwrap(),
                expires: None,
            },
            &vec![],
        )
        .unwrap();

    // add liquidity
    router
        .execute_contract(
            owner.clone(),
            Addr::unchecked(&pair.contract_address),
            &luncswap_pair::msg::ExecuteMsg::AddLiquidity {
                token1_amount: Uint128::new(10),
                min_liquidity: Uint128::zero(),
                max_token2: Uint128::new(1000),
            },
            &vec![Coin::new(Uint128::new(10).into(), NATIVE_TOKEN_DENOM)],
        )
        .unwrap();

    let token_balance = get_token_balance(&owner, &cw20_token.clone(), &router);
    println!("{:?}", token_balance);
    assert_eq!(
        token_balance.balance,
        INITIAL_TOKEN_BALANCE
            .checked_sub(Uint128::new(1000))
            .unwrap()
            .checked_sub(Uint128::new(1000))
            .unwrap()
    );
    let native_balance = get_native_balance(&owner, &router);
    assert_eq!(native_balance, Coin::new(1000 - 10, "lunc"));


    // need to approve first 
    router.execute_contract(swapper.clone(), cw20_token, &cw20_base::msg::ExecuteMsg::IncreaseAllowance {
        spender: pair.contract_address.clone().into(),
        amount: Uint128::from_str("100").unwrap(),
        expires:None
    }, &vec![]).unwrap();

    // token need approval
    router.execute_contract(
        swapper,
        Addr::unchecked(&pair.contract_address),
        &luncswap_pair::msg::ExecuteMsg::Swap { 
            input_token: luncswap_pair::msg::TokenSelect::Token1, 
            input_amount: Uint128::from_str("1").unwrap(), 
            min_output: Uint128::from_str("1").unwrap() },
        &vec![]
    ).unwrap();
}
