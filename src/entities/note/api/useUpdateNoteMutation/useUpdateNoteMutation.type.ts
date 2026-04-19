import type { ProcessingStatus } from "../../model";

export interface UseUpdateNoteRequest {
  noteNumber: number;
  title?: string | null;
  content?: string | null;
}

export interface UseUpdateNoteResponse {
  note_number: number;
  processing_status: ProcessingStatus;
  message: string;
}
