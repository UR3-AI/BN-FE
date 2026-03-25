import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type { DeleteEntityRequest } from "./useDeleteEntityMutation.type";

const deleteEntity = async (uid: DeleteEntityRequest) => {
  await api.delete(`/api/v1/graph/entities/${uid}`);
};

const useDeleteEntityMutation = () => {
  return useMutation({ mutationFn: deleteEntity });
};

export default useDeleteEntityMutation;
