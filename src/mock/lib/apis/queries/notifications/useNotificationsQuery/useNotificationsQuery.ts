import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import notificationKeys from "../keys";
import type {
  NotificationListResponse,
  UseNotificationsQueryParams,
} from "./useNotificationsQuery.type";

const fetchNotifications = async (params: UseNotificationsQueryParams) => {
  const response = await api.get<NotificationListResponse>(
    "/api/v1/notifications",
    { params },
  );
  return response.data;
};

const useNotificationsQuery = (params: UseNotificationsQueryParams = {}) => {
  return useQuery({
    queryKey: [...notificationKeys.list, params],
    queryFn: () => fetchNotifications(params),
  });
};

export default useNotificationsQuery;
