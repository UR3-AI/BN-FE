export interface NoteUpdateRequest {
  noteNumber: number;
  title?: string;
  content: string;
}

export interface NoteUpdateResponse {
  note_number: number;
  processing_status: string;
  message: string;
}
