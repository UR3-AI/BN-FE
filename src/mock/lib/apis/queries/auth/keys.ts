const all = ["auth"] as const;

const authKeys = {
  all,
  me: [...all, "me"] as const,
} as const;

export default authKeys;
