export interface ChatMessage {
  role: string;
  content: string;
  created_at: string;
  sources?: unknown[];
}

export interface ChatSessionDetailResponse {
  session_id: string;
  title: string | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}
