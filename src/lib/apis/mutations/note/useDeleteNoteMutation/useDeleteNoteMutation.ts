import { useMutation } from "@tanstack/react-query";

import { api } from "../../../axios";
import type { UseDeleteNoteMutationRequest } from "./useDeleteNoteMutation.type";

const deleteNote = async ({ noteNumber }: UseDeleteNoteMutationRequest) => {
  await api.delete(`/api/v1/notes/${noteNumber}`);
};

const useDeleteNoteMutation = () => {
  return useMutation({
    mutationFn: deleteNote,
  });
};

export default useDeleteNoteMutation;
