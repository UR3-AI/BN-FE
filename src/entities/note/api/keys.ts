import type { UseNotesInfiniteParams } from "./useNotesInfiniteQuery/useNotesInfiniteQuery.type";
import type { UseNotesParams } from "./useNotesQuery/useNotesQuery.type";

const all = ["note"] as const;

const noteKeys = {
  all,
  lists: [...all, "list"] as const,
  list: (params?: UseNotesParams) => [...all, "list", params] as const,
  infinite: (params?: UseNotesInfiniteParams) => [...all, "list", "infinite", params] as const,

  details: [...all, "detail"] as const,
  detail: (noteNumber: number) => [...all, "detail", noteNumber] as const,

  actions: (noteNumber: number) => [...all, "actions", noteNumber] as const,

  related: (noteNumber: number) => [...all, "related", noteNumber] as const,
} as const;

export default noteKeys;
