import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/debts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
