import type { ReactNode } from "react";

export interface ModalProps {
  children: ReactNode;
  isShow: boolean;
  onClose: () => void;
  disableAwayClick?: boolean;
  hideCloseIcon?: boolean;
}
