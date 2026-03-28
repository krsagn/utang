import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/shared/lib";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onDebtChange = () =>
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    const onFriendshipChange = () =>
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    const onConnectError = (err: Error) =>
      console.error("Socket connection error:", err);

    socket.on("debt:created", onDebtChange);
    socket.on("debt:updated", onDebtChange);
    socket.on("debt:deleted", onDebtChange);
    socket.on("friendship:requested", onFriendshipChange);
    socket.on("friendship:accepted", onFriendshipChange);
    socket.on("friendship:deleted", onFriendshipChange);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("debt:created", onDebtChange);
      socket.off("debt:updated", onDebtChange);
      socket.off("debt:deleted", onDebtChange);
      socket.off("friendship:requested", onFriendshipChange);
      socket.off("friendship:accepted", onFriendshipChange);
      socket.off("friendship:deleted", onFriendshipChange);
      socket.off("connect_error", onConnectError);
    };
  }, [queryClient]);

  return <>{children}</>;
}
