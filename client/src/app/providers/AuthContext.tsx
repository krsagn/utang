import { createContext, useContext } from "react";
import { api } from "@/shared/lib/api";
import type {
  User,
  LoginCredentials,
  SignupCredentials,
} from "@/entities/user";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginCredentials) => void;
  signup: (data: SignupCredentials) => void;
  logout: () => void;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  loginError: Error | null;
  signupError: Error | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/users/me");
      return data.user;
    },
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: LoginCredentials) =>
      api.post("/auth/sessions", creds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/home");
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (creds: SignupCredentials) =>
      api.post("/auth/users", creds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/home");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => api.delete("/auth/sessions/current"),
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      navigate("/login");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login: loginMutation.mutate,
        signup: signupMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isSigningUp: signupMutation.isPending,
        loginError: loginMutation.error,
        signupError: signupMutation.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
