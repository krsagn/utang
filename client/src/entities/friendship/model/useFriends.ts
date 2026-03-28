import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Friendship } from "./types";
import { friendshipQueries } from "./queries";

export function useFriends(type: "pending" | "accepted") {
  return useQuery({
    queryKey: friendshipQueries.list(type),
    queryFn: async () => {
      const { data } = await api.get<Friendship[]>(`/friendships?type=${type}`);
      return data;
    },
    staleTime: 30_000,
  });
}
