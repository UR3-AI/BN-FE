import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  MergeEntitiesRequest,
  MergeEntitiesResponse,
} from "./useMergeEntitiesMutation.type";

const mergeEntities = async (data: MergeEntitiesRequest) => {
  const response = await api.post<MergeEntitiesResponse>(
    "/api/v1/graph/entities/merge",
    data,
  );
  return response.data;
};

const useMergeEntitiesMutation = () => {
  return useMutation({ mutationFn: mergeEntities });
};

export default useMergeEntitiesMutation;
