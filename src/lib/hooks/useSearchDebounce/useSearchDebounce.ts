import { useEffect, useState } from "react";

import { SECOND } from "@/lib/constants";

import type { UseSearchDebounceParams } from "./useSearchDebounce.type";

const DEFAULT_DELAY = SECOND * 0.3;

const useSearchDebounce = ({
  value,
  delay = DEFAULT_DELAY,
}: UseSearchDebounceParams) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useSearchDebounce;
