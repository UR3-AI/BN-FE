import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { AttachmentDownloadRequest } from "./useAttachmentDownload.type";

const downloadAttachment = async ({
  noteNumber,
  attachmentId,
  filename,
}: AttachmentDownloadRequest) => {
  const response = await api.get<Blob>(
    `/api/v1/notes/${noteNumber}/attachments/${attachmentId}/download`,
    { responseType: "blob" },
  );
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const useAttachmentDownload = () => {
  return useMutation({ mutationFn: downloadAttachment });
};

export default useAttachmentDownload;
