/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

export const useDebouncedInput = (ms = 500) => {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const debouncedSet = useCallback(
    debounce((val: string) => {
      setDebouncedInput(val);
    }, ms),
    [setDebouncedInput],
  );

  useEffect(() => {
    debouncedSet(input);
  }, [input, debouncedSet]);

  return [input, debouncedInput, setInput] as const;
};
