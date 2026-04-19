import type { ActionItem } from "./actionItem.type";
import type { ProcessingStatus } from "./processingStatus.type";
import type { SourceType } from "./sourceType.type";

export interface NoteDetail {
  note_number: number;
  title: string | null;
  content: string;
  summary: string | null;
  tags: string[];
  source_type: SourceType;
  source_url: string | null;
  is_pinned: boolean;
  processing_status: ProcessingStatus;
  action_items: ActionItem[];
  attachment_count: number;
  created_at: string;
  updated_at: string;
}
