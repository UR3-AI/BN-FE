import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import graphKeys from "../keys";
import type { EntityMentionsResponse } from "./useEntityMentionsQuery.type";

const fetchEntityMentions = async (uid: string) => {
  const response = await api.get<EntityMentionsResponse>(
    `/api/v1/graph/entities/${uid}/mentions`,
  );
  return response.data;
};

const useEntityMentionsQuery = (uid: string) => {
  return useQuery({
    queryKey: graphKeys.mentions(uid),
    queryFn: () => fetchEntityMentions(uid),
    enabled: !!uid,
  });
};

export default useEntityMentionsQuery;
