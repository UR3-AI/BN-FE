export type ReadNotificationRequest = string;

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  data: unknown;
  is_read: boolean;
  created_at: string;
}
