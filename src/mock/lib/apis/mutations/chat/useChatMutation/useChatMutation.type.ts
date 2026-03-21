export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatSourceNote {
  note_number: number;
  title: string | null;
  summary: string | null;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  sources: ChatSourceNote[];
  created_at: string;
}
