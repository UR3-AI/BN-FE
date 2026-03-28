export interface UsePinNoteMutationRequest {
  noteNumber: number;
  pinned: boolean;
}

export interface UsePinNoteMutationResponse {
  note_number: number;
  is_pinned: boolean;
}
