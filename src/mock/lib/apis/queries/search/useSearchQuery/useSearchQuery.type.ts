export interface UnifiedSearchNoteItem {
  note_number: number;
  title: string | null;
  summary: string | null;
  content_preview: string;
  tags: string[];
  processing_status: string;
  created_at: string;
  match_source: string;
  similarity_score: number | null;
}

export interface UnifiedSearchEntityItem {
  uid: string;
  name: string;
  type: string;
  mention_count: number;
}

export interface UnifiedSearchResponse {
  notes: UnifiedSearchNoteItem[];
  entities: UnifiedSearchEntityItem[];
  query: string;
  has_next: boolean;
}

export interface UseSearchQueryParams {
  q: string;
  skip?: number;
  limit?: number;
}
