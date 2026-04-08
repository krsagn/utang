import { friendshipQueries, type Friendship } from "@/entities/friendship";
import { api } from "@/shared/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFriend(type: Friendship["status"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) =>
      api.delete<void>(`/friendships/${friendshipId}`),
    onSuccess: () => {
      // Refresh the specific friendship list to remove the deleted user
      queryClient.invalidateQueries({ queryKey: friendshipQueries.list(type) });
    },
  });
}
