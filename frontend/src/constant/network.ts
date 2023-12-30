import { TokenMeta } from "@/interface";

export const factoryContractAddress = {
  "pisco-1": "terra1tepxa0vatksmqnywmpsnzmp2nqpr9ed9scm62gex3maygeaegk0sdq6x9l",
};

export const trustedTokens = {
  "pisco-1": [
    "terra1y52vpctg3whkh9c4nak8udd8jmkvsmprajg5cslw33ekwtcj70hslu8nga",
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
      logo: {
        url: "/lunc.svg",
      },
      marketing: null,
      project: null,
    },
  },
};
