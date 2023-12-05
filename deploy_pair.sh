
read -r -d '' INIT << EOM
{
  "token1_denom": {"cw20": "terra1jg932mx0dgccmnzctp56eyfjxsnv9wvr4zdcvn57qsm4t7m54wnsmnhwxn"},
  "token2_denom": {"native": "uluna"},
  "owner": "terra1nhhefpw3yw2jl0yenfq0rk3m4uwn6f3pja63zv",
  "protocol_fee_recipient": "terra1nhhefpw3yw2jl0yenfq0rk3m4uwn6f3pja63zv",
  "protocol_fee_percent": "0.2",
  "lp_token_code_id": 31
}
EOM

CODE_ID=36

terrad tx wasm instantiate $CODE_ID "$INIT" \
  --from personal --label "luncswap v2" --gas-prices 0.1uluna --gas=auto --gas-adjustment 1.3 -y --no-admin
