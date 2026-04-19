export interface UseRemoveTagsRequest {
  noteNumber: number;
  tags: string[];
}

export interface UseRemoveTagsResponse {
  note_number: number;
  tags: string[];
}
