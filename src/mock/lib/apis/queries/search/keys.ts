const all = ["search"] as const;

const searchKeys = {
  all,
  unified: (q: string) => [...all, "unified", q] as const,
  tags: [...all, "tags"] as const,
} as const;

export default searchKeys;
