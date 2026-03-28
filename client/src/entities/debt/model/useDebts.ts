import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { Debt, DebtType } from "./types";
import { socket } from "@/shared/lib";
import { useEffect } from "react";

export function useDebts(type?: DebtType, status?: Debt["status"]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on("debt:created", () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    });
    socket.on("debt:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    });
    socket.on("debt:deleted", () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    });

    return () => {
      socket.off("debt:created");
      socket.off("debt:updated");
      socket.off("debt:deleted");
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["debts", type, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (status) params.set("status", status);

      const { data } = await api.get<Debt[]>(`/debts?${params}`);
      return data;
    },
    staleTime: 30_000,
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
    initialDataUpdatedAt: () => {
      const allDebtQueries = queryClient.getQueriesData<Debt[]>({
        queryKey: ["debts"],
      });

      let latest = 0;
      for (const [key] of allDebtQueries) {
        const updatedAt = queryClient.getQueryState(key)?.dataUpdatedAt ?? 0;
        if (updatedAt > latest) latest = updatedAt;
      }

      return latest || undefined;
    },
  });
}
