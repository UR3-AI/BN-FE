import { useQuery } from "@tanstack/react-query";

import { api } from "../../../axios";
import projectKeys from "../keys";
import type { UseProjectTreeResponse } from "./useProjectTreeQuery.type";

const getProjectTree = async () => {
  const response = await api.get<UseProjectTreeResponse>(
    "/api/v1/projects/tree",
  );

  return response.data;
};

const useProjectTreeQuery = () => {
  return useQuery({
    queryKey: projectKeys.tree,
    queryFn: getProjectTree,
  });
};

export default useProjectTreeQuery;
