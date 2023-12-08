import { task } from "@terra-money/terrain";

task(async ({ wallets, client, deploy }) => {
  await deploy.storeCode("luncswap_token", wallets.default);
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
  console.log("address", tokenAddress);
});
