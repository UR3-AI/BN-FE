import type { UseNotesQueryParams } from "./useNotesQuery/useNotesQuery.type";

const all = ["note"] as const;

const noteKeys = {
  all,
  lists: [...all, "list"] as const,
  list: (params?: UseNotesQueryParams) => [...all, "list", params] as const,
} as const;

export default noteKeys;
