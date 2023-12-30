import { task } from "@terra-money/terrain";

task(async ({ wallets, deploy }) => {
  try {
    const tokenCodeId = await deploy.storeCode(
      "luncswap_token",
      wallets.default
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
      },
    ]);
  } catch (err) {
    console.log(err);
  }
});
