import type { ProcessingStatus, SourceType } from "@lib/types";

export interface UseCreateNoteMutationRequest {
  title?: string | null;
  content?: string;
  source_type?: SourceType;
  url?: string | null;
}

export interface UseCreateNoteMutationResponse {
  note_number: number;
  processing_status: ProcessingStatus;
  message: string;
}
