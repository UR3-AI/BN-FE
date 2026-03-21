export interface PinNoteRequest {
  noteNumber: number;
  pinned: boolean;
}

export interface PinNoteResponse {
  note_number: number;
  is_pinned: boolean;
}
