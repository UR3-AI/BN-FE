import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type { UseDeleteNoteRequest } from "./useDeleteNoteMutation.type";

const deleteNote = async ({ noteNumber }: UseDeleteNoteRequest) => {
  await api.delete(`/api/v1/notes/${noteNumber}`);
};

const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists });
    },
  });
};

export default useDeleteNoteMutation;
