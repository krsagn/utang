import { useSession } from "@/entities/user";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { data: user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
