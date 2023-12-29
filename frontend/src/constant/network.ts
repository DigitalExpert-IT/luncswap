import { TokenMeta } from "@/interface";

export const factoryContractAddress = {
  "pisco-1": "terra1zae93l3h3nhtg6v28wlv7jev9m5fwcr2t94eqznyqdhhr0x6y40sn2sc7l",
};

export const trustedTokens = {
  "pisco-1": [
    "terra10m5zy8krcnqtrzkpegphlmetm6huvedxx6rwzu6rymq7wzkqg5rs9qm9af",
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
