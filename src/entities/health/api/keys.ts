const all = ["health"] as const;

const healthKeys = {
  all,

  check: [...all, "check"],
} as const;

export default healthKeys;
