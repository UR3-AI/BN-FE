import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { LogoutRequest } from "./useLogoutMutation.type";

const logout = async (data: LogoutRequest) => {
  await api.post("/api/v1/auth/logout", data);
};

const useLogoutMutation = () => {
  return useMutation({ mutationFn: logout });
};

export default useLogoutMutation;
