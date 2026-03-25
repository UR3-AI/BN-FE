import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import graphKeys from "../keys";
import type { GraphStatsResponse } from "./useGraphStatsQuery.type";

const fetchGraphStats = async (hubLimit?: number) => {
  const response = await api.get<GraphStatsResponse>("/api/v1/graph/stats", {
    params: hubLimit ? { hub_limit: hubLimit } : undefined,
  });

  return response.data;
};

const useGraphStatsQuery = (hubLimit?: number) => {
  return useQuery({
    queryKey: [...graphKeys.stats, hubLimit],
    queryFn: () => fetchGraphStats(hubLimit),
  });
};

export default useGraphStatsQuery;
