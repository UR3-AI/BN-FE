const all = ["notes"] as const;

const notesKeys = {
  all,
  list: [...all, "list"] as const,
  detail: (noteNumber: number) => [...all, "detail", noteNumber] as const,
  actions: (noteNumber: number) => [...all, "actions", noteNumber] as const,
  related: (noteNumber: number) => [...all, "related", noteNumber] as const,
} as const;

export default notesKeys;
