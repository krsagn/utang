import { Sidebar, RightSidebar } from "@/widgets/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { FriendsSidebar, useFriendsSidebar } from "@/widgets/friends-sidebar";
import { cn } from "@/shared/lib";
import { RealtimeProvider } from "@/app/providers/RealtimeProvider";

export function AppLayout() {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isOpen, closeSidebar } = useFriendsSidebar();

  // reset scroll position on route change
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    // close friends sidebar on route change
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <RealtimeProvider>
      <div className="bg-background relative flex h-screen w-full overflow-hidden">
        <FriendsSidebar />

        {/* Main Blurred Canvas */}
        <motion.div
          initial={false}
          animate={{
            x: isOpen ? 320 : 0,
          }}
          transition={{
            type: "tween",
            ease: [0.42, 0, 0.58, 1],
            duration: 0.5,
          }}
          className={cn(
            "bg-background relative z-10 flex h-screen w-full shrink-0 overflow-hidden will-change-transform",
            isOpen && "pointer-events-none",
          )}
        >
          <Sidebar />
          <div
            ref={scrollRef}
            className="no-scrollbar relative flex flex-1 flex-col overflow-y-auto overscroll-none"
          >
            <motion.main
              key={pathname}
              initial={{ opacity: 1, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="z-10 flex flex-1 items-center justify-center"
            >
              <Outlet />
            </motion.main>
          </div>
          <RightSidebar />

          {/* Tint overlay & click-to-close */}
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{
              type: "tween",
              ease: [0.42, 0, 0.58, 1],
              duration: 0.5,
            }}
            className={cn(
              "bg-background/40 absolute inset-0 z-50 backdrop-blur-md",
              isOpen ? "pointer-events-auto" : "pointer-events-none",
            )}
            onClick={isOpen ? closeSidebar : undefined}
          />
        </motion.div>
      </div>
    </RealtimeProvider>
  );
}
