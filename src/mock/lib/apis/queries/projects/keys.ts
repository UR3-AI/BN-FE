const all = ["projects"] as const;

const projectKeys = {
  all,
  list: [...all, "list"] as const,
  detail: (id: string) => [...all, "detail", id] as const,
} as const;

export default projectKeys;
