import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, socket } from "@/shared/lib";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => api.delete("/auth/sessions/current"),
    onSuccess: () => {
      queryClient.clear();
      socket.disconnect();
      navigate("/");
    },
  });
}
