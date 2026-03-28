import type { NoteListItem } from "@lib/types";

export interface UseNotesParams {
  skip?: number;
  limit?: number;
  cursor?: string | null;
  date_from?: string | null;
  tag?: string | null;
  search?: string | null;
  pinned?: boolean | null;
}

export interface UseNotesResponse {
  items: NoteListItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  next_cursor: string | null;
}
