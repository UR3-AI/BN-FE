import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import graphKeys from "../keys";
import type { EntityDetailResponse } from "./useEntityDetailQuery.type";

const fetchEntityDetail = async (uid: string) => {
  const response = await api.get<EntityDetailResponse>(
    `/api/v1/graph/entities/${uid}`,
  );

  return response.data;
};

const useEntityDetailQuery = (uid: string) => {
  return useQuery({
    queryKey: graphKeys.entityDetail(uid),
    queryFn: () => fetchEntityDetail(uid),
    enabled: !!uid,
  });
};

export default useEntityDetailQuery;
