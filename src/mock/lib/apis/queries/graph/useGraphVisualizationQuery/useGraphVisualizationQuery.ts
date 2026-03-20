import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import graphKeys from "../keys";
import type { GraphVisualizationResponse } from "./useGraphVisualizationQuery.type";

const fetchGraphVisualization = async () => {
  const response = await api.get<GraphVisualizationResponse>("/api/v1/graph/visualization");

  return response.data;
};

const useGraphVisualizationQuery = () => {
  return useQuery({
    queryKey: graphKeys.visualization,
    queryFn: fetchGraphVisualization,
  });
};

export default useGraphVisualizationQuery;
