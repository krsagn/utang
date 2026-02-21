import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/entities/user";

export default function AuthRedirect() {
  const { data: user, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <Navigate to="/home" replace />;

  return <Outlet />;
}
