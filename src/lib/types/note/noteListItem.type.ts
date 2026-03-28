import type { ProcessingStatus } from "./processingStatus.type";

export interface NoteListItem {
  note_number: number;
  title: string | null;
  summary: string | null;
  content_preview: string;
  tags: string[];
  has_action_items: boolean;
  is_pinned: boolean;
  processing_status: ProcessingStatus;
  created_at: string;
}
