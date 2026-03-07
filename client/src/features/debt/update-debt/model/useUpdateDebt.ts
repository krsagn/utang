import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Debt } from "@/entities/debt";
import type { UpdateDebtPayload } from "./types";
import { useSession } from "@/entities/user";

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();

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
      // Refresh the specific debt list and instantly update the detailed view cache
      const type = updatedDebt.lendeeId === currentUser?.id ? "pay" : "receive";
      queryClient.invalidateQueries({ queryKey: ["debts", type] });
      queryClient.setQueryData(["debt", updatedDebt.id], updatedDebt);
    },
  });
}
