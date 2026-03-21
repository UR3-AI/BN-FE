import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { UpdateTimezoneRequest, UserResponse } from "./useUpdateTimezoneMutation.type";

const updateTimezone = async (data: UpdateTimezoneRequest) => {
  const response = await api.patch<UserResponse>("/api/v1/users/me/timezone", data);
  return response.data;
};

const useUpdateTimezoneMutation = () => {
  return useMutation({ mutationFn: updateTimezone });
};

export default useUpdateTimezoneMutation;
