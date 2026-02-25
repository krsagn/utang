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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
