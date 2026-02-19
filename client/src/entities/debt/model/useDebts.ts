import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import type { Debt, NewDebt, UpdateDebt } from "./types";

export function useDebts(type?: "pay" | "receive") {
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

export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDebt: NewDebt) => {
      const { data } = await api.post<Debt>("/debts", newDebt);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<Debt>(`/debts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateDebt;
    }) => {
      const { data } = await api.patch<Debt>(`/debts/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
