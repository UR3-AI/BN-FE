export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  data: unknown;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  total: number;
}

export interface UseNotificationsQueryParams {
  limit?: number;
  offset?: number;
}
