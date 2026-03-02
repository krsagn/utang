import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { User } from "./types";

export function useSearchUser(q: string) {
  return useQuery({
    queryKey: ["users", q],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);

      const { data } = await api.get<User[]>(`/users/search?${params}`);
      return data;
    },
    enabled: q.length >= 2,
  });
}
