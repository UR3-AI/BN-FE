import { api } from "@shared/api/axios";
import { useMutation } from "@tanstack/react-query";

import type { UseLoginRequest, UseLoginResponse } from "./useLoginMutation.type";

const login = async (data: UseLoginRequest) => {
  const response = await api.post<UseLoginResponse>("/api/v1/auth/login", data);

  return response.data;
};

const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};

export default useLoginMutation;
