export interface SharedEntity {
  name: string;
  type: string;
}

export interface RelatedNoteItem {
  note_number: number;
  title: string | null;
  summary: string | null;
  tags: string[];
  shared_entities: SharedEntity[];
  shared_count: number;
  connection_type: string;
  relevance_score: number;
  created_at: string;
}
