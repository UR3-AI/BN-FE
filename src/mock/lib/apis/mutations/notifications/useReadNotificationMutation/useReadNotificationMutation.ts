import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  NotificationResponse,
  ReadNotificationRequest,
} from "./useReadNotificationMutation.type";

const readNotification = async (notificationId: ReadNotificationRequest) => {
  const response = await api.patch<NotificationResponse>(
    `/api/v1/notifications/${notificationId}/read`,
  );
  return response.data;
};

const useReadNotificationMutation = () => {
  return useMutation({ mutationFn: readNotification });
};

export default useReadNotificationMutation;
