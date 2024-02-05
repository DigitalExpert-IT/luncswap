import { Denom, TokenInfoList } from "@/interface";

export const getPairKey = (denomList: [Denom, Denom]) => {
  return JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    denomList.map((item: any) => item.cw20 || item.native).sort(),
  );
};

export const pairName = (pair?: Denom, tokensInfo?: TokenInfoList) => {
  if (pair?.native) return "LUNC";
  if (!tokensInfo || !tokensInfo[pair?.cw20 as ""]) return null;
  return tokensInfo[pair?.cw20 as ""].name;
};

export const pairIcon = (pair?: Denom, tokensInfo?: TokenInfoList) => {
  if (tokensInfo && tokensInfo[pair?.cw20 as ""])
    return tokensInfo[pair?.cw20 as ""]?.logo?.url;
  return "/lunc.png";
};
