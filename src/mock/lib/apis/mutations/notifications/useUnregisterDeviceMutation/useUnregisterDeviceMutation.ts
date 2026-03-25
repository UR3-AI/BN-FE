import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

const unregisterDevice = async () => {
  await api.delete("/api/v1/notifications/devices");
};

const useUnregisterDeviceMutation = () => {
  return useMutation({ mutationFn: unregisterDevice });
};

export default useUnregisterDeviceMutation;
