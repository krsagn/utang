import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/debts/${id}`),
    onSuccess: () => {
      // Refresh all debt lists to remove the deleted item from the dashboard
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
