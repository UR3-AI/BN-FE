import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import notificationKeys from "../keys";
import type { UnreadCountResponse } from "./useUnreadCountQuery.type";

const fetchUnreadCount = async () => {
  const response = await api.get<UnreadCountResponse>("/api/v1/notifications/unread-count");

  return response.data;
};

const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: fetchUnreadCount,
  });
};

export default useUnreadCountQuery;
