import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  DeleteTagRequest,
  DeleteTagResponse,
} from "./useDeleteTagMutation.type";

const deleteTag = async (tagName: DeleteTagRequest) => {
  const response = await api.delete<DeleteTagResponse>(
    `/api/v1/tags/${encodeURIComponent(tagName)}`,
  );
  return response.data;
};

const useDeleteTagMutation = () => {
  return useMutation({ mutationFn: deleteTag });
};

export default useDeleteTagMutation;
