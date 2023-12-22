import { Denom } from "@/interface";

export const getPairKey = (denomList: [Denom, Denom]) => {
  return JSON.stringify(denomList.sort());
};
