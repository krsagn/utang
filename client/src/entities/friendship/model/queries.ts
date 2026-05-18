export const friendshipQueries = {
  all: () => ["friendships"] as const,
  list: (type: "pending" | "accepted") =>
    [...friendshipQueries.all(), type] as const,
  stats: (friendshipId: string) =>
    [...friendshipQueries.all(), "stats", friendshipId] as const,
};
