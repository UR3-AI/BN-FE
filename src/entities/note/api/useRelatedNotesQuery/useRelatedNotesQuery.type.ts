import type { RelatedNoteItem } from "../../model";

export interface UseRelatedNotesParams {
  noteNumber: number;
  limit?: number;
  depth?: number;
}

export interface UseRelatedNotesResponse {
  items: RelatedNoteItem[];
}
