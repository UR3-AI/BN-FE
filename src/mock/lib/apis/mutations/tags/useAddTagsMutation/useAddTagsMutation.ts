import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  AddTagsRequest,
  AddTagsResponse,
} from "./useAddTagsMutation.type";

const addTags = async ({ noteNumber, tags }: AddTagsRequest) => {
  const response = await api.post<AddTagsResponse>(
    `/api/v1/notes/${noteNumber}/tags`,
    { tags },
  );
  return response.data;
};

const useAddTagsMutation = () => {
  return useMutation({ mutationFn: addTags });
};

export default useAddTagsMutation;
