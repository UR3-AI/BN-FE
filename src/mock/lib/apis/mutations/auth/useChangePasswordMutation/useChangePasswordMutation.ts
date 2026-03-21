import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { ChangePasswordRequest } from "./useChangePasswordMutation.type";

const changePassword = async (data: ChangePasswordRequest) => {
  await api.patch("/api/v1/auth/password", data);
};

const useChangePasswordMutation = () => {
  return useMutation({ mutationFn: changePassword });
};

export default useChangePasswordMutation;
