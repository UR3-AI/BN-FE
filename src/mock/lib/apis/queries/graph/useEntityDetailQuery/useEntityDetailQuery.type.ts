export interface EntityNoteItem {
  note_number: number;
  title: string | null;
  created_at: string;
}

export interface RelatedEntity {
  uid: string;
  name: string;
  type: string;
  relationship_type: string;
}

export interface EntityDetailResponse {
  uid: string;
  name: string;
  type: string;
  mention_count: number;
  notes: EntityNoteItem[];
  related_entities: RelatedEntity[];
}
