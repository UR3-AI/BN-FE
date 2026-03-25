import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import projectKeys from "../keys";
import type {
  ProjectListResponse,
  UseProjectsQueryParams,
} from "./useProjectsQuery.type";

const fetchProjects = async (params: UseProjectsQueryParams) => {
  const response = await api.get<ProjectListResponse>("/api/v1/projects", {
    params,
  });
  return response.data;
};

const useProjectsQuery = (params: UseProjectsQueryParams = {}) => {
  return useQuery({
    queryKey: [...projectKeys.list, params],
    queryFn: () => fetchProjects(params),
  });
};

export default useProjectsQuery;
