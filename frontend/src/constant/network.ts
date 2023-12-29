import { TokenMeta } from "@/interface";

export const factoryContractAddress = {
  "pisco-1": "terra1zae93l3h3nhtg6v28wlv7jev9m5fwcr2t94eqznyqdhhr0x6y40sn2sc7l",
};

export const trustedTokens = {
  "pisco-1": [
    "terra1w5c853etgdrhp5uhum0xade3qrz5a33pv52fhkxqzya9mkx2225sw58aq7",
    "terra1lfqnp85lcuy6mrvq5jd9kvkv0csh9va7y5wtmf0ecwdsk92jjx5qrz3nsj",
  ],
};

export const nativeCoin: Record<string, TokenMeta> = {
  "pisco-1": {
    isNative: true,
    address: "native",
    info: {
      decimals: 6,
      name: "luna",
      symbol: "uluna",
      total_supply: String(1000000000e6),
    },
    marketing: {
      description: null,
      logo: null,
      marketing: null,
      project: null,
    },
  },
};
