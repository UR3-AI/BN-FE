import type { ChatSourceNote } from "@/mock/lib/apis/mutations/chat/useChatMutation/useChatMutation.type";

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  sources: ChatSourceNote[];
  created_at: string;
}

export interface ChatSessionDetailResponse {
  session_id: string;
  title: string | null;
  messages: ChatMessage[];
  created_at: string;
}
