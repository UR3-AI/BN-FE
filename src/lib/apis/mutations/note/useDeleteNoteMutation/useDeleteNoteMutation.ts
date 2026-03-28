import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../axios";
import noteKeys from "../../../queries/note/keys";
import type { UseDeleteNoteRequest } from "./useDeleteNoteMutation.type";

const deleteNote = async ({ noteNumber }: UseDeleteNoteRequest) => {
  await api.delete(`/api/v1/notes/${noteNumber}`);
};

const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
};

export default useDeleteNoteMutation;
