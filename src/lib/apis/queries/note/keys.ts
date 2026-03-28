import type { UseNotesInfiniteParams } from "./useNotesInfiniteQuery/useNotesInfiniteQuery.type";
import type { UseNotesParams } from "./useNotesQuery/useNotesQuery.type";

const all = ["note"] as const;

const noteKeys = {
  all,
  lists: [...all, "list"] as const,
  list: (params?: UseNotesParams) => [...all, "list", params] as const,
  infinite: (params?: UseNotesInfiniteParams) => [...all, "list", "infinite", params] as const,
} as const;

export default noteKeys;
