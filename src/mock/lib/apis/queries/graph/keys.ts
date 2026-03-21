const all = ["graph"] as const;

const graphKeys = {
  all,
  visualization: [...all, "visualization"] as const,
  stats: [...all, "stats"] as const,
  entityDetail: (uid: string) => [...all, "entity", uid] as const,
  neighbors: (uid: string) => [...all, "neighbors", uid] as const,
  list: [...all, "entities-list"] as const,
  mentions: (uid: string) => [...all, "mentions", uid] as const,
} as const;

export default graphKeys;
