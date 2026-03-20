import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import searchKeys from "../keys";
import type { TagListResponse } from "./useTagsQuery.type";

const fetchTags = async () => {
  const response = await api.get<TagListResponse>("/api/v1/tags");

  return response.data;
};

const useTagsQuery = () => {
  return useQuery({
    queryKey: searchKeys.tags,
    queryFn: fetchTags,
  });
};

export default useTagsQuery;
