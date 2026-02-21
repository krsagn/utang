import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib";
import { useNavigate } from "react-router-dom";
import type { SignupCredentials } from "./types";

export function useSignup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (creds: SignupCredentials) =>
      api.post("/auth/users", creds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/home");
    },
  });
}
