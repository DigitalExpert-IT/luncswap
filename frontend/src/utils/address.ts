export const shortenAddress = (addr: string) => {
  return addr.slice(0, 5) + "..." + addr.slice(addr.length - 5);
};
