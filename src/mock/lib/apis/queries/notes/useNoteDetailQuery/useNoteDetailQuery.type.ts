export interface ActionItemResponse {
  id: number;
  type: string;
  summary: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  confidence_score: number;
  research_status: string | null;
  research_note_number: number | null;
}

export interface NoteDetailResponse {
  note_number: number;
  title: string | null;
  content: string;
  summary: string | null;
  tags: string[];
  source_type: string;
  is_pinned: boolean;
  processing_status: string;
  action_items: ActionItemResponse[];
  created_at: string;
  updated_at: string;
}
