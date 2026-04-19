import { api } from "@shared/api/axios";
import { useMutation } from "@tanstack/react-query";

import type { UseRegisterRequest, UseRegisterResponse } from "./useRegisterMutation.type";

const register = async (data: UseRegisterRequest) => {
  const response = await api.post<UseRegisterResponse>("/api/v1/auth/register", data);

  return response.data;
};

const useRegisterMutation = () => {
  return useMutation({
    mutationFn: register,
  });
};

export default useRegisterMutation;
