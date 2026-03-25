import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import graphKeys from "../keys";
import type { EntityNeighborsResponse } from "./useEntityNeighborsQuery.type";

interface UseEntityNeighborsParams {
  uid: string;
  depth?: number;
  limit?: number;
}

const fetchEntityNeighbors = async ({
  uid,
  depth,
  limit,
}: UseEntityNeighborsParams) => {
  const response = await api.get<EntityNeighborsResponse>(
    `/api/v1/graph/entities/${uid}/neighbors`,
    { params: { depth, limit } },
  );

  return response.data;
};

const useEntityNeighborsQuery = (params: UseEntityNeighborsParams) => {
  return useQuery({
    queryKey: [...graphKeys.neighbors(params.uid), params],
    queryFn: () => fetchEntityNeighbors(params),
    enabled: !!params.uid,
  });
};

export default useEntityNeighborsQuery;
