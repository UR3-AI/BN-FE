export interface UsePinNoteRequest {
  noteNumber: number;
  pinned: boolean;
}

export interface UsePinNoteResponse {
  note_number: number;
  is_pinned: boolean;
}
