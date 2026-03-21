export interface SharedEntity {
  name: string;
  type: string;
}

export interface RelatedNote {
  note_number: number;
  title: string | null;
  summary: string | null;
  tags: string[];
  shared_entities: SharedEntity[];
  shared_count: number;
  connection_type: "direct" | "indirect" | "semantic";
  relevance_score: number;
  created_at: string;
}

export interface RelatedNotesResponse {
  items: RelatedNote[];
}
