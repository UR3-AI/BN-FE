import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { ModalPortalProps } from "./ModalPortal.type";

const ModalPortal = ({ isShow, children }: ModalPortalProps) => {
  const [modalBaseElement] = useState<HTMLElement | null>(document.body);

  useEffect(() => {
    if (!modalBaseElement || !isShow) return;

    const originalStyle = window.getComputedStyle(modalBaseElement).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isShow, modalBaseElement]);

  if (!isShow || !modalBaseElement) {
    return null;
  }

  return createPortal(<>{children}</>, modalBaseElement);
};

export default ModalPortal;
