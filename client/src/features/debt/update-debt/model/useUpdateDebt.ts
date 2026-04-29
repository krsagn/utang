import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Debt } from "@/entities/debt";
import type { UpdateDebtPayload } from "./types";

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateDebtPayload;
    }) => {
      const { data } = await api.patch<Debt>(`/debts/${id}`, updates);
      return data;
    },
    onSuccess: (updatedDebt) => {
      const previousDebt = queryClient.getQueryData<Debt>(["debt", updatedDebt.id]);
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "debts" && query.queryKey[2] !== "paid",
      });
      if (
        updatedDebt.status === "paid" ||
        previousDebt?.status === "paid"
      ) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "debts" && query.queryKey[2] === "paid",
        });
      }
      queryClient.setQueryData(["debt", updatedDebt.id], updatedDebt);
    },
  });
}
