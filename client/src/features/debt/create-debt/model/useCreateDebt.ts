import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Debt } from "@/entities/debt";
import type { NewDebt } from "./types";
import { useSession } from "@/entities/user";

export function useCreateDebt() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();

  return useMutation({
    mutationFn: async (newDebt: NewDebt) => {
      const payload = {
        ...newDebt,
        lendeeId: newDebt.lendeeId || undefined,
        lenderId: newDebt.lenderId || undefined,
        description: newDebt.description || undefined,
        deadline: newDebt.deadline || undefined,
      };

      const { data } = await api.post<Debt>("/debts", payload);
      return data;
    },
    onSuccess: (newDebt) => {
      const type = newDebt.lendeeId === currentUser?.id ? "pay" : "receive";
      queryClient.invalidateQueries({ queryKey: ["debts", type] });
      queryClient.setQueryData(["debt", newDebt.id], newDebt);
    },
  });
}
