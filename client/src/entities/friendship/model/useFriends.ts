import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Friendship } from "./types";
import { friendshipQueries } from "./queries";
import { socket } from "@/shared/lib";
import { useEffect } from "react";

export function useFriends(type: "pending" | "accepted") {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on("friendship:requested", () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    });
    socket.on("friendship:accepted", () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    });
    socket.on("friendship:deleted", () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    });

    return () => {
      socket.off("friendship:requested");
      socket.off("friendship:accepted");
      socket.off("friendship:deleted");
    };
  }, [queryClient]);

  return useQuery({
    queryKey: friendshipQueries.list(type),
    queryFn: async () => {
      const { data } = await api.get<Friendship[]>(`/friendships?type=${type}`);
      return data;
    },
    staleTime: 30_000,
  });
}
