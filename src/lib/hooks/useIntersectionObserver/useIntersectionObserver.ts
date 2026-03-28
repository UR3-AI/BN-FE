import { useEffect, useRef } from "react";

import type { UseIntersectionObserverParams } from "./useIntersectionObserver.type";

const useIntersectionObserver = ({
  onIntersect,
  enabled = true,
  rootMargin = "0px",
}: UseIntersectionObserverParams) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [enabled, onIntersect, rootMargin]);

  return sentinelRef;
};

export default useIntersectionObserver;
