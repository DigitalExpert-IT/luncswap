export const toHumaneValue = (
  val: bigint | string | number,
  decimals: number,
) => {
  const normalizedVal =
    typeof val === "bigint"
      ? +val.toString()
      : typeof val === "string"
        ? +val
        : val;
  return String(normalizedVal / Math.pow(10, decimals));
};
