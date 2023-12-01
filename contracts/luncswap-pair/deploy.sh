
read -r -d '' INIT << EOM
{
  "token1_denom": {"native": "uluna"},
  "token2_denom": {"native": "uluna"},
  "owner": "terra1nhhefpw3yw2jl0yenfq0rk3m4uwn6f3pja63zv",
  "protocol_fee_recipient": "terra1nhhefpw3yw2jl0yenfq0rk3m4uwn6f3pja63zv",
  "protocol_fee_percent": "0.2"
}
EOM

CODE_ID=21

terrad tx wasm instantiate $CODE_ID "$INIT" \
  --from personal --label "my first contract" --gas-prices 0.1uluna --gas=auto --gas-adjustment 1.3 -b sync -y --no-admin
