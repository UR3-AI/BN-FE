export interface UseNotesInfiniteParams {
  limit?: number;
  date_from?: string;
  tag?: string;
  search?: string;
  pinned?: boolean;
}

export interface UseNotesInfiniteRequest extends UseNotesInfiniteParams {
  cursor?: string | null;
}
