use std::env::current_dir;
use std::fs::create_dir_all;

use cosmwasm_schema::{export_schema, remove_schemas, schema_for};

use luncswap_pair::msg::{
    ExecuteMsg, FeeResponse, InfoResponse, InstantiateMsg, QueryMsg, Token1ForToken2PriceResponse,
    Token2ForToken1PriceResponse, TokenSelect,
};
use luncswap_pair::state::{Fees, Token};

fn main() {
    let mut out_dir = current_dir().unwrap();
    out_dir.push("schema");
    create_dir_all(&out_dir).unwrap();
    remove_schemas(&out_dir).unwrap();

    export_schema(&schema_for!(InstantiateMsg), &out_dir);
    export_schema(&schema_for!(ExecuteMsg), &out_dir);
    export_schema(&schema_for!(QueryMsg), &out_dir);
    export_schema(&schema_for!(Token), &out_dir);
    export_schema(&schema_for!(Fees), &out_dir);
    export_schema(&schema_for!(TokenSelect), &out_dir);
    export_schema(&schema_for!(InfoResponse), &out_dir);
    export_schema(&schema_for!(FeeResponse), &out_dir);
    export_schema(&schema_for!(Token1ForToken2PriceResponse), &out_dir);
    export_schema(&schema_for!(Token2ForToken1PriceResponse), &out_dir);
}
