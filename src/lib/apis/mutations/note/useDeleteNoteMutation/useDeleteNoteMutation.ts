import { useMutation } from "@tanstack/react-query";

import { api } from "../../../axios";
import type { UseDeleteNoteRequest } from "./useDeleteNoteMutation.type";

const deleteNote = async ({ noteNumber }: UseDeleteNoteRequest) => {
  await api.delete(`/api/v1/notes/${noteNumber}`);
};

const useDeleteNoteMutation = () => {
  return useMutation({
    mutationFn: deleteNote,
  });
};

export default useDeleteNoteMutation;
