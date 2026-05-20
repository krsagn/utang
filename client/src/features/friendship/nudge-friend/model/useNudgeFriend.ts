import { api } from "@/shared/lib";
import { useMutation } from "@tanstack/react-query";

export function useNudgeFriend() {
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      await api.post<void>(`/friendships/${friendshipId}/nudge`);
    },
  });
}
