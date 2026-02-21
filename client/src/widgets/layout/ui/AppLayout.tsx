import { Sidebar } from "@/widgets/sidebar";
import { Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="bg-background flex min-h-screen w-full">
      <Sidebar />
      <main
        key={location.pathname}
        className="animate-in fade-in zoom-in-98 flex-1 p-10 duration-300"
      >
        <Outlet />
      </main>
    </div>
  );
}
