import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  ExecuteActionRequest,
  ExecuteActionResponse,
} from "./useExecuteActionMutation.type";

const executeAction = async (actionId: ExecuteActionRequest) => {
  const response = await api.post<ExecuteActionResponse>(
    `/api/v1/actions/${actionId}/execute`,
  );
  return response.data;
};

const useExecuteActionMutation = () => {
  return useMutation({ mutationFn: executeAction });
};

export default useExecuteActionMutation;
