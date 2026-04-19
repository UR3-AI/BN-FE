import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import { noteKeys } from "@entities/note";
import type { UseAddTagsRequest, UseAddTagsResponse } from "./useAddTagsMutation.type";

const addTags = async ({ noteNumber, ...data }: UseAddTagsRequest) => {
  const response = await api.post<UseAddTagsResponse>(`/api/v1/notes/${noteNumber}/tags`, data);

  return response.data;
};

const useAddTagsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTags,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.noteNumber) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists });
    },
  });
};

export default useAddTagsMutation;
