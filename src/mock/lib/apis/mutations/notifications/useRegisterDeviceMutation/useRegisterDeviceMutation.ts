import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type {
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from "./useRegisterDeviceMutation.type";

const registerDevice = async (data: RegisterDeviceRequest) => {
  const response = await api.post<RegisterDeviceResponse>("/api/v1/notifications/devices", data);
  return response.data;
};

const useRegisterDeviceMutation = () => {
  return useMutation({ mutationFn: registerDevice });
};

export default useRegisterDeviceMutation;
