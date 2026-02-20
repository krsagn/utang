import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import { useNavigate } from "react-router-dom";
import type { LoginCredentials } from "./types";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (creds: LoginCredentials) =>
      api.post("/auth/sessions", creds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/home");
    },
  });
}
