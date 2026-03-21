import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { DeleteAttachmentRequest } from "./useDeleteAttachmentMutation.type";

const deleteAttachment = async ({ noteNumber, attachmentId }: DeleteAttachmentRequest) => {
  await api.delete(`/api/v1/notes/${noteNumber}/attachments/${attachmentId}`);
};

const useDeleteAttachmentMutation = () => {
  return useMutation({ mutationFn: deleteAttachment });
};

export default useDeleteAttachmentMutation;
