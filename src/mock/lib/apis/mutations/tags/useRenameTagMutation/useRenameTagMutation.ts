import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  RenameTagRequest,
  RenameTagResponse,
} from "./useRenameTagMutation.type";

const renameTag = async (data: RenameTagRequest) => {
  const response = await api.post<RenameTagResponse>(
    "/api/v1/tags/rename",
    data,
  );
  return response.data;
};

const useRenameTagMutation = () => {
  return useMutation({ mutationFn: renameTag });
};

export default useRenameTagMutation;
