import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

export default function AuthRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <Navigate to="/home" replace />;

  return <Outlet />;
}
