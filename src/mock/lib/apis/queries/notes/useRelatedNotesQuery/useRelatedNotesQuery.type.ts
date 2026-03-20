export interface RelatedNote {
  note_number: number;
  title: string | null;
  similarity_score: number;
}

export interface RelatedNotesResponse {
  items: RelatedNote[];
}
