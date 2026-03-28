import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../axios";
import noteKeys from "../../../queries/note/keys";
import type {
  UseCreateNoteRequest,
  UseCreateNoteResponse,
} from "./useCreateNoteMutation.type";

const createNote = async (data: UseCreateNoteRequest) => {
  const response = await api.post<UseCreateNoteResponse>(
    "/api/v1/notes",
    data,
  );

  return response.data;
};

const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
};

export default useCreateNoteMutation;
