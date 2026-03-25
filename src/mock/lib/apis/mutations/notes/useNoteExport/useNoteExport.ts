import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type { NoteExportRequest } from "./useNoteExport.type";

const exportNote = async ({ noteNumber, format }: NoteExportRequest) => {
  const response = await api.get<Blob>(`/api/v1/notes/${noteNumber}/export`, {
    params: { format },
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `note-${noteNumber}.${format === "markdown" ? "md" : "pdf"}`;
  a.click();
  URL.revokeObjectURL(url);
};

const useNoteExport = () => {
  return useMutation({ mutationFn: exportNote });
};

export default useNoteExport;
