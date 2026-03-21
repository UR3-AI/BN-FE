import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { ReadAllNotificationsResponse } from "./useReadAllNotificationsMutation.type";

const readAllNotifications = async () => {
  const response = await api.post<ReadAllNotificationsResponse>("/api/v1/notifications/read-all");
  return response.data;
};

const useReadAllNotificationsMutation = () => {
  return useMutation({ mutationFn: readAllNotifications });
};

export default useReadAllNotificationsMutation;
