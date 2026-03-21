import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { UploadAttachmentRequest, UploadAttachmentResponse } from "./useUploadAttachmentMutation.type";

const uploadAttachment = async ({ noteNumber, file }: UploadAttachmentRequest) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<UploadAttachmentResponse>(
    `/api/v1/notes/${noteNumber}/attachments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

const useUploadAttachmentMutation = () => {
  return useMutation({ mutationFn: uploadAttachment });
};

export default useUploadAttachmentMutation;
