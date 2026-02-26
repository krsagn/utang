import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Friendship } from "./types";

export function useFriends(type: "pending" | "accepted") {
  return useQuery({
    queryKey: ["friendships", type],
    queryFn: async () => {
      const { data } = await api.get<Friendship[]>(`/friendships?type=${type}`);
      return data;
    },
  });
}
