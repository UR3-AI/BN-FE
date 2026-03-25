import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  UpdateEntityRequest,
  UpdateEntityResponse,
} from "./useUpdateEntityMutation.type";

const updateEntity = async ({ uid, ...data }: UpdateEntityRequest) => {
  const response = await api.patch<UpdateEntityResponse>(
    `/api/v1/graph/entities/${uid}`,
    data,
  );
  return response.data;
};

const useUpdateEntityMutation = () => {
  return useMutation({ mutationFn: updateEntity });
};

export default useUpdateEntityMutation;
