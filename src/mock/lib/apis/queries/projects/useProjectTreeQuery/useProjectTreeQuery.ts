import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import projectKeys from "../keys";
import type { ProjectTreeResponse } from "./useProjectTreeQuery.type";

const fetchProjectTree = async () => {
  const response = await api.get<ProjectTreeResponse>("/api/v1/projects/tree");
  return response.data;
};

const useProjectTreeQuery = () => {
  return useQuery({
    queryKey: [...projectKeys.all, "tree"],
    queryFn: fetchProjectTree,
  });
};

export default useProjectTreeQuery;
