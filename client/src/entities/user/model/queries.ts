export const userQueries = {
  all: () => ["users"] as const,
  search: (q: string) => [...userQueries.all(), "search", q] as const,
};
