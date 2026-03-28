import type { UseAwayClickModalProps } from "./useAwayClickModal.type";

const useAwayClickModal = (onClose: UseAwayClickModalProps) => {
  const handleCloseModal = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    onClose();
  };

  return handleCloseModal;
};

export default useAwayClickModal;
