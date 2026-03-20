export interface NoteCreateRequest {
  content: string;
  source_type?: "text" | "voice_stt" | "link";
}

export interface NoteCreateResponse {
  note_number: number;
  processing_status: string;
  message: string;
}
