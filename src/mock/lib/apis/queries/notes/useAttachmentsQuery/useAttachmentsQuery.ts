import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import notesKeys from "../keys";
import type { AttachmentsResponse } from "./useAttachmentsQuery.type";

const fetchAttachments = async (noteNumber: number) => {
  const response = await api.get<AttachmentsResponse>(
    `/api/v1/notes/${noteNumber}/attachments`,
  );
  return response.data;
};

const useAttachmentsQuery = (noteNumber: number) => {
  return useQuery({
    queryKey: [...notesKeys.detail(noteNumber), "attachments"],
    queryFn: () => fetchAttachments(noteNumber),
    enabled: noteNumber > 0,
  });
};

export default useAttachmentsQuery;
