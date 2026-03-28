import { useEffect, useRef } from "react";

import type { UseKeydownModalProps } from "./useKeydownModal.type";

const useKeydownModal = ({ callback, isShow, disableAwayClick }: UseKeydownModalProps) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isShow || disableAwayClick) {
      return;
    }

    const handleEvent = ({ key }: KeyboardEvent) => {
      if (key !== "Escape") {
        return;
      }

      callbackRef.current();
    };

    window.addEventListener("keydown", handleEvent);

    return () => window.removeEventListener("keydown", handleEvent);
  }, [disableAwayClick, isShow]);
};

export default useKeydownModal;
