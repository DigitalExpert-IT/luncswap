import { useMap } from "./useMap";

export const useStrongMap = <T extends Record<string, unknown>>() => {
  const [_map, _setMap] = useMap<
    keyof T,
    {
      [K in keyof T]: T[K];
    }
  >();

  return [_map, _setMap] as const;
};
