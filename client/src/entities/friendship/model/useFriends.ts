import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Friendship } from "./types";

export function useFriends(type: "pending" | "accepted") {
  return useQuery({
    queryKey: ["friendships", type],
    queryFn: async () => {
      const url = type ? `/friendships?type=${type}` : "/friendships";
      const { data } = await api.get<Friendship[]>(url);
      return data;
    },
  });
}
