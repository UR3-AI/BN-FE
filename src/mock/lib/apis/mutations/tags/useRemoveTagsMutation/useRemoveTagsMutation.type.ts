export interface RemoveTagsRequest {
  noteNumber: number;
  tags: string[];
}

export interface RemoveTagsResponse {
  note_number: number;
  tags: string[];
}
