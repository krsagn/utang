import { Sidebar, RightSidebar } from "@/widgets/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { FriendsSidebar, useFriendsSidebar } from "@/widgets/friends-sidebar";
import { cn } from "@/shared/lib";

export function AppLayout() {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const gradientOpacity = useTransform(scrollY, [0, 20], [0, 1]);
  const { isOpen, closeSidebar } = useFriendsSidebar();

  // reset scroll position on route change
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    // Optional: close sidebar on route change? Sure.
    closeSidebar();
  }, [pathname, closeSidebar]);

  // exponential scrim to eliminate linear gradient banding
  const scrimGradient = `linear-gradient(to bottom, 
    var(--background) 0%, 
    color-mix(in oklch, var(--background) 73.8%, transparent) 19%, 
    color-mix(in oklch, var(--background) 54.1%, transparent) 34%, 
    color-mix(in oklch, var(--background) 38.2%, transparent) 47%, 
    color-mix(in oklch, var(--background) 27.8%, transparent) 56.5%, 
    color-mix(in oklch, var(--background) 19.4%, transparent) 65%, 
    color-mix(in oklch, var(--background) 12.6%, transparent) 73%, 
    color-mix(in oklch, var(--background) 7.5%, transparent) 80.2%, 
    color-mix(in oklch, var(--background) 4.2%, transparent) 86.1%, 
    color-mix(in oklch, var(--background) 2.1%, transparent) 91%, 
    color-mix(in oklch, var(--background) 0.8%, transparent) 95.2%, 
    transparent 100%
  )`;

  const flippedScrimGradient = `linear-gradient(to top, 
    var(--background) 0%, 
    color-mix(in oklch, var(--background) 73.8%, transparent) 19%, 
    color-mix(in oklch, var(--background) 54.1%, transparent) 34%, 
    color-mix(in oklch, var(--background) 38.2%, transparent) 47%, 
    color-mix(in oklch, var(--background) 27.8%, transparent) 56.5%, 
    color-mix(in oklch, var(--background) 19.4%, transparent) 65%, 
    color-mix(in oklch, var(--background) 12.6%, transparent) 73%, 
    color-mix(in oklch, var(--background) 7.5%, transparent) 80.2%, 
    color-mix(in oklch, var(--background) 4.2%, transparent) 86.1%, 
    color-mix(in oklch, var(--background) 2.1%, transparent) 91%, 
    color-mix(in oklch, var(--background) 0.8%, transparent) 95.2%, 
    transparent 100%
  )`;

  return (
    <div className="bg-background relative flex h-screen w-full overflow-hidden">
      <FriendsSidebar />

      {/* Main Blurred Canvas */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 320 : 0,
        }}
        transition={{ type: "tween", ease: [0.42, 0, 0.58, 1], duration: 0.5 }}
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
          {/* top scroll shadow fades in as you scroll down */}
          <motion.div
            style={{ opacity: gradientOpacity, backgroundImage: scrimGradient }}
            className="pointer-events-none sticky top-0 z-20 h-10 shrink-0"
          />

          <motion.main
            key={pathname}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 flex flex-1 items-center justify-center px-10 pb-10"
          >
            <Outlet />
          </motion.main>

          {/* bottom scroll shadow */}
          <div
            style={{ backgroundImage: flippedScrimGradient }}
            className="pointer-events-none fixed -bottom-[0.5px] z-20 h-10 w-full shrink-0"
          />
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
  );
}
