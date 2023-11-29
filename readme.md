## Deployment

### LocalTerra
```bash
# store the code on chain
terrad tx wasm store artifacts/luncswap.wasm --from personal --chain-id=localterra --gas-prices=0.1uluna --gas=auto --gas-adjustment=1.3 -y --output json
```
