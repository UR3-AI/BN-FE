export interface ChatSessionItem {
  session_id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionListResponse {
  items: ChatSessionItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

export interface UseChatSessionsQueryParams {
  skip?: number;
  limit?: number;
}
