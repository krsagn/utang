export const friendshipQueries = {
  all: () => ["friendships"] as const,
  list: (type: "pending" | "accepted") =>
    [...friendshipQueries.all(), type] as const,
};
