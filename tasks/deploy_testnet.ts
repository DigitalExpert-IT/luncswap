import { task } from "@terra-money/terrain";

task(async ({ wallets, client, deploy }) => {
  try {
    const tokenCodeId = await deploy.storeCode(
      "luncswap_token",
      wallets.default
    );
    const tokenAddress = await deploy.instantiate(
      "luncswap_token",
      wallets.default,
      {
        admin: wallets.default.key.accAddress("terra"),
        init: {
          name: "along token",
          symbol: "along",
          decimals: 6,
          initial_balances: [
            {
              address: wallets.default.key.accAddress("terra"),
              amount: "1000000000000000",
            },
          ],
        },
      }
    );
    const pairCodeId = await deploy.storeCode(
      "luncswap_pair",
      wallets.default,
      { noRebuild: true }
    );
    const factoryCodeId = await deploy.storeCode(
      "luncswap_factory",
      wallets.default,
      { noRebuild: true }
    );
    const factoryAddress = await deploy.instantiate(
      "luncswap_factory",
      wallets.default,
      {
        init: {
          protocol_fee_recipient: wallets.default.key.accAddress("terra"),
          protocol_fee_percent: "0.5",
          lp_token_code_id: +tokenCodeId,
          pair_code_id: +pairCodeId,
        },
      }
    );
    console.table([
      {
        factoryAddress,
        factoryCodeId,
        tokenAddress,
      },
    ]);
  } catch (err) {
    console.log(err);
  }
});
