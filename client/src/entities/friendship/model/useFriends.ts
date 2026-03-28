import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Friendship } from "./types";
import { friendshipQueries } from "./queries";
import { socket } from "@/shared/lib";
import { useEffect } from "react";

export function useFriends(type: "pending" | "accepted") {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onFriendshipRequested = () => queryClient.invalidateQueries({ queryKey: ["friendships"] });
    const onFriendshipAccepted = () => queryClient.invalidateQueries({ queryKey: ["friendships"] });
    const onFriendshipDeleted = () => queryClient.invalidateQueries({ queryKey: ["friendships"] });

    socket.on("friendship:requested", onFriendshipRequested);
    socket.on("friendship:accepted", onFriendshipAccepted);
    socket.on("friendship:deleted", onFriendshipDeleted);

    return () => {
      socket.off("friendship:requested", onFriendshipRequested);
      socket.off("friendship:accepted", onFriendshipAccepted);
      socket.off("friendship:deleted", onFriendshipDeleted);
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
