import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { DeleteProjectRequest } from "./useDeleteProjectMutation.type";

const deleteProject = async (projectId: DeleteProjectRequest) => {
  await api.delete(`/api/v1/projects/${projectId}`);
};

const useDeleteProjectMutation = () => {
  return useMutation({ mutationFn: deleteProject });
};

export default useDeleteProjectMutation;
