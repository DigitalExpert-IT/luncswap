import { useEffect, useRef } from "react";

export const useMount = (cb: () => void) => {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    cb();
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
