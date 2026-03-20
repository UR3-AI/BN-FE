const all = ["notifications"] as const;

const notificationKeys = {
  all,
  unreadCount: [...all, "unread-count"] as const,
} as const;

export default notificationKeys;
