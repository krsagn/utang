import { api } from "@/shared/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendshipQueries } from "@/entities/friendship";

export function useAddFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data } = await api.post<string>("/friendships", {
        id: targetUserId,
      });
      return data;
    },
    onSuccess: () => {
      // Refresh all friendship lists to reflect the new pending request
      queryClient.invalidateQueries({ queryKey: friendshipQueries.all() });
    },
  });
}
