import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import graphKeys from "../keys";
import type { GraphVisualizationResponse } from "./useGraphVisualizationQuery.type";

const fetchGraphVisualization = async (limit?: number) => {
  const response = await api.get<GraphVisualizationResponse>(
    "/api/v1/graph/visualization",
    { params: limit ? { limit } : undefined },
  );

  return response.data;
};

const useGraphVisualizationQuery = (limit?: number) => {
  return useQuery({
    queryKey: [...graphKeys.visualization, limit],
    queryFn: () => fetchGraphVisualization(limit),
  });
};

export default useGraphVisualizationQuery;
