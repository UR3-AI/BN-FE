import { CloseIcon } from "@app/components/Icons";

import type { ModalProps } from "./Modal.type";
import { ModalPortal } from "./components";
import { useAwayClickModal, useKeydownModal } from "./hooks";

import { AnimatePresence, motion } from "motion/react";

const Modal = ({
  children,
  isShow,
  onClose,
  hideCloseIcon = false,
  disableAwayClick = false,
}: ModalProps) => {
  const handleCloseModal = useAwayClickModal(onClose);

  useKeydownModal({
    callback: onClose,
    isShow,
    disableAwayClick,
  });

  return (
    <AnimatePresence>
      {isShow && (
        <ModalPortal isShow={isShow}>
          <motion.section
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50"
            onClick={event => !disableAwayClick && handleCloseModal(event)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.article
              className={`relative min-h-[6.4rem] min-w-[6.4rem] rounded-[1.6rem] bg-white p-[2.4rem] shadow-lg ${!hideCloseIcon ? "pt-[4rem]" : ""}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {!hideCloseIcon && (
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="absolute top-[0.8rem] right-[0.8rem] flex size-[3.2rem] cursor-pointer items-center justify-center rounded-[0.6rem] text-icon hover:bg-gray-bg"
                  whileTap={{ scale: 1.2 }}
                  aria-label="Close modal"
                >
                  <CloseIcon size="1.6rem" />
                </motion.button>
              )}

              {children}
            </motion.article>
          </motion.section>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
};

export default Modal;
