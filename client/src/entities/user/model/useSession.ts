import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import type { User } from "./types";

export function useSession() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/sessions/current");
      return data.user;
    },
    retry: false,
    staleTime: Infinity,
  });
}
