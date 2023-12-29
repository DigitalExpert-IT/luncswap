import { Dec } from "@terra-money/feather.js";

export const toHumaneValue = (val: Dec | string | number, decimals: number) => {
  const normalizedVal =
    val instanceof Dec ? +val.toString() : typeof val === "string" ? +val : val;
  return String(normalizedVal / Math.pow(10, decimals));
};
