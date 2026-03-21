import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

const unregisterDevice = async () => {
  await api.delete("/api/v1/notifications/devices");
};

const useUnregisterDeviceMutation = () => {
  return useMutation({ mutationFn: unregisterDevice });
};

export default useUnregisterDeviceMutation;
