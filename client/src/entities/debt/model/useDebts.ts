import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["debt", id],
    queryFn: async () => {
      const { data } = await api.get<Debt>(`/debts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
