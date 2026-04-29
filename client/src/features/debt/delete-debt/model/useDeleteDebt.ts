import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/debts/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "debts" && query.queryKey[2] !== "paid",
      });
      queryClient.removeQueries({ queryKey: ["debt", id] });
    },
  });
}
