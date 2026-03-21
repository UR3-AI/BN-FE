import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { CreateProjectRequest, ProjectDetailResponse } from "./useCreateProjectMutation.type";

const createProject = async (data: CreateProjectRequest) => {
  const response = await api.post<ProjectDetailResponse>("/api/v1/projects", data);
  return response.data;
};

const useCreateProjectMutation = () => {
  return useMutation({ mutationFn: createProject });
};

export default useCreateProjectMutation;
