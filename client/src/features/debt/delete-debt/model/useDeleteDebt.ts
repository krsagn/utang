import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/debts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
