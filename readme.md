### Requirements
1. NodeJS 16
2. rustc 1.73.0
3. docker
4. Latest pnpm

### Installation
add wasm32 target

```bash
rustup target add wasm32-unknown-unknown
```

compile contracts

```bash
cargo wasm
```

install frontend deps & run deployment, make sure you already provide `MNEMONIC` in `.env` file

```bash
pnpm install
pnpm run deploy:testnet
```

## FAQ

- how to show result of `println!` in cargo test
```bash
cargo test -- --nocapture
```
