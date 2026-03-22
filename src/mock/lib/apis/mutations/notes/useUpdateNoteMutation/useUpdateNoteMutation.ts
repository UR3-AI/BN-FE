import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { NoteUpdateRequest, NoteUpdateResponse } from "./useUpdateNoteMutation.type";

const updateNote = async ({ noteNumber, title, content }: NoteUpdateRequest) => {
  const response = await api.patch<NoteUpdateResponse>(`/api/v1/notes/${noteNumber}`, { title, content });
  return response.data;
};

const useUpdateNoteMutation = () => {
  return useMutation({ mutationFn: updateNote });
};

export default useUpdateNoteMutation;
