
read -r -d '' INIT << EOM
{
  "name": "along token",
  "symbol": "along",
  "decimals": 6,
  "initial_balances": [{
    "address": "terra1nhhefpw3yw2jl0yenfq0rk3m4uwn6f3pja63zv",
    "amount": "1000000000000000"
  }]
}
EOM

CODE_ID=26

terrad tx wasm instantiate $CODE_ID "$INIT" \
  --from personal --label "cw20 contract" --gas-prices 0.1uluna --gas=auto --gas-adjustment 1.3 -b sync -y --no-admin
