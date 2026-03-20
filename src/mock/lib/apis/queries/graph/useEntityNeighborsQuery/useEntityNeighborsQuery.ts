import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import graphKeys from "../keys";
import type { EntityNeighborsResponse } from "./useEntityNeighborsQuery.type";

const fetchEntityNeighbors = async (uid: string) => {
  const response = await api.get<EntityNeighborsResponse>(`/api/v1/graph/entities/${uid}/neighbors`);

  return response.data;
};

const useEntityNeighborsQuery = (uid: string) => {
  return useQuery({
    queryKey: graphKeys.neighbors(uid),
    queryFn: () => fetchEntityNeighbors(uid),
    enabled: !!uid,
  });
};

export default useEntityNeighborsQuery;
