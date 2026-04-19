import type { ProcessingStatus } from "../../model";

export interface UseReprocessNoteRequest {
  noteNumber: number;
}

export interface UseReprocessNoteResponse {
  note_number: number;
  processing_status: ProcessingStatus;
  message: string;
}
