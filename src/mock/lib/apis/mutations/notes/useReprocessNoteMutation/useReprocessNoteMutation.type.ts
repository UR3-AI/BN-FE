export type ReprocessNoteRequest = number;

export interface ReprocessNoteResponse {
  note_number: number;
  processing_status: string;
  message: string;
}
