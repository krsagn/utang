import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Debt, DebtType } from "./types";

export function useDebts(type?: DebtType) {
  return useQuery({
    queryKey: ["debts", type],
    queryFn: async () => {
      const url = type ? `/debts?type=${type}` : "/debts";
      const { data } = await api.get<Debt[]>(url);
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
      const payDebts = queryClient.getQueryData<Debt[]>(["debts", "pay"]);
      const receiveDebts = queryClient.getQueryData<Debt[]>([
        "debts",
        "receive",
      ]);
      return (
        payDebts?.find((d) => d.id === id) ??
        receiveDebts?.find((d) => d.id === id)
      );
    },
  });
}
