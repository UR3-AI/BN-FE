const all = ["chat"] as const;

const chatKeys = {
  all,
  sessions: [...all, "sessions"] as const,
  session: (id: string) => [...all, "session", id] as const,
} as const;

export default chatKeys;
