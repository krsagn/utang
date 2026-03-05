import { friendshipQueries, type Friendship } from "@/entities/friendship";
import { api } from "@/shared/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFriend(type: Friendship["status"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) =>
      api.delete(`/friendships/${friendshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendshipQueries.list(type) });
    },
  });
}
