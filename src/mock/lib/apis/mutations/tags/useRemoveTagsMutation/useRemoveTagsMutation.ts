import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  RemoveTagsRequest,
  RemoveTagsResponse,
} from "./useRemoveTagsMutation.type";

const removeTags = async ({ noteNumber, tags }: RemoveTagsRequest) => {
  const response = await api.delete<RemoveTagsResponse>(
    `/api/v1/notes/${noteNumber}/tags`,
    { data: { tags } },
  );
  return response.data;
};

const useRemoveTagsMutation = () => {
  return useMutation({ mutationFn: removeTags });
};

export default useRemoveTagsMutation;
