import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, socket } from "@/shared/lib";
import { useNavigate } from "react-router-dom";
import type { LoginCredentials } from "./types";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (creds: LoginCredentials) =>
      api.post<void>("/auth/sessions", creds),
    onSuccess: async () => {
      // Refresh the global 'me' query so the UI picks up the new authenticated user
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      socket.connect();
      navigate("/home");
    },
  });
}
