import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import searchKeys from "../keys";
import type {
  UnifiedSearchResponse,
  UseSearchQueryParams,
} from "./useSearchQuery.type";

const fetchSearch = async (params: UseSearchQueryParams) => {
  const response = await api.get<UnifiedSearchResponse>("/api/v1/search", {
    params,
  });

  return response.data;
};

const useSearchQuery = (params: UseSearchQueryParams) => {
  return useQuery({
    queryKey: [...searchKeys.unified(params.q), params],
    queryFn: () => fetchSearch(params),
    enabled: !!params.q,
  });
};

export default useSearchQuery;
