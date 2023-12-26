import { TokenMeta } from "@/interface";

export const factoryContractAddress = {
  "pisco-1": "terra1lsyzk6f98x7hw4238d4q277p0t8j20ppt8aydsn35m030ytg0ywst33dx4",
};

export const trustedTokens = {
  "pisco-1": [
    "terra1w5c853etgdrhp5uhum0xade3qrz5a33pv52fhkxqzya9mkx2225sw58aq7",
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
