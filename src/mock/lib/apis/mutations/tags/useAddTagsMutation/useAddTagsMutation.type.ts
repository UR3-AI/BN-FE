export interface AddTagsRequest {
  noteNumber: number;
  tags: string[];
}

export interface AddTagsResponse {
  note_number: number;
  tags: string[];
}
