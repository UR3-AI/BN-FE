import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import projectKeys from "../keys";
import type { ProjectDetailResponse } from "./useProjectDetailQuery.type";

const fetchProjectDetail = async (projectId: string) => {
  const response = await api.get<ProjectDetailResponse>(`/api/v1/projects/${projectId}`);
  return response.data;
};

const useProjectDetailQuery = (projectId: string) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => fetchProjectDetail(projectId),
    enabled: !!projectId,
  });
};

export default useProjectDetailQuery;
