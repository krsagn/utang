import { Sidebar } from "@/widgets/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="bg-background flex min-h-screen w-full overflow-clip">
      <Sidebar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "tween", ease: "easeOut" }}
          className="flex-1 p-10"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
