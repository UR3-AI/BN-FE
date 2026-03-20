export interface NoteUpdateRequest {
  noteNumber: number;
  content: string;
}

export interface NoteUpdateResponse {
  note_number: number;
  processing_status: string;
  message: string;
}
