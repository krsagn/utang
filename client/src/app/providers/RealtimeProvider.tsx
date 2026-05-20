import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/shared/lib";
import { toast } from "sonner";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onDebtChange = () =>
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    const onFriendshipChange = () =>
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    const onConnectError = (err: Error) =>
      console.error("Socket connection error:", err);
    const onReconnect = () => {
      queryClient.invalidateQueries();
    };
    const onNudge = (data: {
      from: { firstName: string };
    }) => {
      toast(`${data.from.firstName} just nudged you`, {
        description: "Looks like someone wants their money back...",
      });
    };

    socket.on("debt:created", onDebtChange);
    socket.on("debt:updated", onDebtChange);
    socket.on("debt:deleted", onDebtChange);
    socket.on("friendship:requested", onFriendshipChange);
    socket.on("friendship:accepted", onFriendshipChange);
    socket.on("friendship:deleted", onFriendshipChange);
    socket.on("friendship:nudge", onNudge);
    socket.on("connect_error", onConnectError);
    // "reconnect" is a Manager-level event; socket.io is the Manager instance
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("debt:created", onDebtChange);
      socket.off("debt:updated", onDebtChange);
      socket.off("debt:deleted", onDebtChange);
      socket.off("friendship:requested", onFriendshipChange);
      socket.off("friendship:accepted", onFriendshipChange);
      socket.off("friendship:deleted", onFriendshipChange);
      socket.off("friendship:nudge", onNudge);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect", onReconnect);
    };
  }, [queryClient]);

  return <>{children}</>;
}
