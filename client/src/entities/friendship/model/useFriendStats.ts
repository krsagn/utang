import { useQuery } from "@tanstack/react-query";
import { friendshipQueries } from "./queries";
import { api } from "@/shared/lib";
import type { FriendStats } from "./types";

export function useFriendStats(friendshipId: string, enabled: boolean) {
  return useQuery({
    queryKey: friendshipQueries.stats(friendshipId),
    queryFn: async () => {
      const { data } = await api.get<FriendStats>(
        `/friendships/${friendshipId}/stats`,
      );
      return data;
    },
    enabled,
  });
}
