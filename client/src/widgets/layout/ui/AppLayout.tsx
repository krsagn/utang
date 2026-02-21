import { Sidebar } from "@/widgets/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="bg-background flex min-h-screen w-full overflow-clip">
      <Sidebar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="flex-1 p-10"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
