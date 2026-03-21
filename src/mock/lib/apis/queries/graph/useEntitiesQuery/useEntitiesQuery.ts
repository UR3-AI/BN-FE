import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import graphKeys from "../keys";
import type { EntityListResponse, UseEntitiesQueryParams } from "./useEntitiesQuery.type";

const fetchEntities = async (params: UseEntitiesQueryParams) => {
  const response = await api.get<EntityListResponse>("/api/v1/graph/entities", { params });
  return response.data;
};

const useEntitiesQuery = (params: UseEntitiesQueryParams = {}) => {
  return useQuery({
    queryKey: [...graphKeys.list, params],
    queryFn: () => fetchEntities(params),
  });
};

export default useEntitiesQuery;
