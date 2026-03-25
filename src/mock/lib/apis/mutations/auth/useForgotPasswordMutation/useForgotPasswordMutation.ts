import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "./useForgotPasswordMutation.type";

const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await api.post<ForgotPasswordResponse>(
    "/api/v1/auth/forgot-password",
    data,
  );
  return response.data;
};

const useForgotPasswordMutation = () => {
  return useMutation({ mutationFn: forgotPassword });
};

export default useForgotPasswordMutation;
