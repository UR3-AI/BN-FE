import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { ResetPasswordRequest, ResetPasswordResponse } from "./useResetPasswordMutation.type";

const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await api.post<ResetPasswordResponse>("/api/v1/auth/reset-password", data);
  return response.data;
};

const useResetPasswordMutation = () => {
  return useMutation({ mutationFn: resetPassword });
};

export default useResetPasswordMutation;
