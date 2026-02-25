import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Debt, DebtType } from "./types";

export function useDebts(type?: DebtType, status?: Debt["status"]) {
  return useQuery({
    queryKey: ["debts", type, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (status) params.set("status", status);

      const { data } = await api.get<Debt[]>(`/debts?${params}`);
      return data;
    },
  });
}

export function useDebt(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["debt", id],
    queryFn: async () => {
      const { data } = await api.get<Debt>(`/debts/${id}`);
      return data;
    },
    enabled: !!id,
    initialData: () => {
      const allDebtQueries = queryClient.getQueriesData<Debt[]>({
        queryKey: ["debts"],
      });

      for (const [, debts] of allDebtQueries) {
        const found = debts?.find((d) => d.id === id);
        if (found) return found;
      }
    },
  });
}
