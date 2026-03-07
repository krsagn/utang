import { api } from "@/shared/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendshipQueries } from "@/entities/friendship";

export function useAcceptFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetFriendshipId: string) => {
      const { data } = await api.patch<string>(
        `/friendships/${targetFriendshipId}`,
      );
      return data;
    },
    onSuccess: () => {
      // Refetch all friendships so the UI reflects the newly accepted status
      queryClient.invalidateQueries({ queryKey: friendshipQueries.all() });
    },
  });
}
