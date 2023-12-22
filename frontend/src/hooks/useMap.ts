import { useCallback, useState } from "react";

export const useMap = <K, V>() => {
  const [_map, _setMap] = useState<Map<K, V>>(new Map());

  const setMap = useCallback((k: K, v: V) => {
    _setMap(prev => {
      const newMap = new Map(prev);
      newMap.set(k, v);
      return newMap;
    });
  }, []);

  return [_map, setMap] as const;
};
