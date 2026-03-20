export interface NoteListItem {
  note_number: number;
  title: string | null;
  summary: string | null;
  content_preview: string;
  tags: string[];
  has_action_items: boolean;
  is_pinned: boolean;
  processing_status: string;
  created_at: string;
}

export interface NoteListResponse {
  items: NoteListItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

export interface UseNotesQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  tag?: string;
  pinned?: boolean;
}
