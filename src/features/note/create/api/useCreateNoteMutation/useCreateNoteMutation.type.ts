import type { ProcessingStatus, SourceType } from "@entities/note";

export interface UseCreateNoteRequest {
  title?: string | null;
  content?: string;
  source_type?: SourceType;
  url?: string | null;
}

export interface UseCreateNoteResponse {
  note_number: number;
  processing_status: ProcessingStatus;
  message: string;
}
