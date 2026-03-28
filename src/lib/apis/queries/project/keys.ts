const all = ["project"] as const;

const projectKeys = {
  all,
  tree: [...all, "tree"] as const,
} as const;

export default projectKeys;
