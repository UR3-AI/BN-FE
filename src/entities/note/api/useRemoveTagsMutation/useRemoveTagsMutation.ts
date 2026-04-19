import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type { UseRemoveTagsRequest, UseRemoveTagsResponse } from "./useRemoveTagsMutation.type";

const removeTags = async ({ noteNumber, ...data }: UseRemoveTagsRequest) => {
  const response = await api.delete<UseRemoveTagsResponse>(`/api/v1/notes/${noteNumber}/tags`, {
    data,
  });

  return response.data;
};

const useRemoveTagsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTags,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.noteNumber) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists });
    },
  });
};

export default useRemoveTagsMutation;
