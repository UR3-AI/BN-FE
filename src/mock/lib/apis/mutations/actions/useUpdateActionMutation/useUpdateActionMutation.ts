import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type {
  ActionItemResponse,
  ActionItemUpdateRequest,
} from "./useUpdateActionMutation.type";

const updateAction = async ({ actionId, ...data }: ActionItemUpdateRequest) => {
  const response = await api.patch<ActionItemResponse>(`/api/v1/actions/${actionId}`, data);
  return response.data;
};

const useUpdateActionMutation = () => {
  return useMutation({ mutationFn: updateAction });
};

export default useUpdateActionMutation;
