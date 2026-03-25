import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type { DeleteNoteRequest } from "./useDeleteNoteMutation.type";

const deleteNote = async (noteNumber: DeleteNoteRequest) => {
  await api.delete(`/api/v1/notes/${noteNumber}`);
};

const useDeleteNoteMutation = () => {
  return useMutation({ mutationFn: deleteNote });
};

export default useDeleteNoteMutation;
