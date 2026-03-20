import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import graphKeys from "../keys";
import type { GraphStatsResponse } from "./useGraphStatsQuery.type";

const fetchGraphStats = async () => {
  const response = await api.get<GraphStatsResponse>("/api/v1/graph/stats");

  return response.data;
};

const useGraphStatsQuery = () => {
  return useQuery({
    queryKey: graphKeys.stats,
    queryFn: fetchGraphStats,
  });
};

export default useGraphStatsQuery;
