import { Denom } from "@/interface";

export const getPairKey = (denomList: [Denom, Denom]) => {
  return JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    denomList.map((item: any) => item.cw20 || item.native).sort(),
  );
};
