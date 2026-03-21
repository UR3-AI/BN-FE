import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { ProjectDetailResponse, UpdateProjectRequest } from "./useUpdateProjectMutation.type";

const updateProject = async ({ projectId, ...data }: UpdateProjectRequest) => {
  const response = await api.patch<ProjectDetailResponse>(`/api/v1/projects/${projectId}`, data);
  return response.data;
};

const useUpdateProjectMutation = () => {
  return useMutation({ mutationFn: updateProject });
};

export default useUpdateProjectMutation;
