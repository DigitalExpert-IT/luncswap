import { TokenMeta } from "@/interface";
import { LCDClientConfig } from "@terra-money/feather.js";

const piscoLCD: LCDClientConfig = {
  lcd: "https://pisco-lcd.terra.dev",
  chainID: "pisco-1",
  gasPrices: { uluna: 0.015 },
  gasAdjustment: 2,
  prefix: "terra",
};

export const lcdConfigMap = {
  "pisco-1": piscoLCD,
} as const;

export const factoryContractAddress = {
  "pisco-1": "terra1tepxa0vatksmqnywmpsnzmp2nqpr9ed9scm62gex3maygeaegk0sdq6x9l",
};

export const trustedTokens = {
  "pisco-1": [
    "terra1y52vpctg3whkh9c4nak8udd8jmkvsmprajg5cslw33ekwtcj70hslu8nga",
    "terra1v0uzzq49fa0jp9qkmnce2fzywuqlwm2xw3zd3vdek99jvhpdd28qncnklf",
    "terra1dc6d6v4wrkv20hmpjuhee56xmg6zl6y3np0sntu4cr9z9hz0h0vqaz7w4k",
    "terra1dc62muhtvzurajky2wwll69afa3re5jv393jnmteg6vn0dlwl75s9yla50",
    "terra15tc0ucch3s0ja5cgvr4np0qu8e74hwrq2l4wz9j6vzl09qnfhedqhe9av4",
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
