import { Sidebar } from "@/widgets/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/widgets/navbar";
import { useRef } from "react";

const titleMap: Record<string, string> = {
  "/home": "Home",
  "/debts/outgoing": "To Pay",
  "/debts/incoming": "To Receive",
  "/friends": "Friends",
};

export function AppLayout() {
  const { pathname } = useLocation();
  const scrollRef = useRef(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const gradientOpacity = useTransform(scrollY, [0, 20], [0, 1]);

  // An exponential 'scrim' gradient to completely eliminate linear banding.
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
    <div className="bg-background flex h-screen w-full overflow-hidden overscroll-none">
      <Sidebar />
      <div
        ref={scrollRef}
        className="relative flex flex-1 flex-col overflow-y-auto overscroll-none [scrollbar-gutter:stable]"
      >
        <div className="bg-background sticky top-0 z-20 mb-5 flex flex-col">
          <Navbar title={titleMap[pathname] || ""} />
          <motion.div
            style={{ opacity: gradientOpacity, backgroundImage: scrimGradient }}
            className="pointer-events-none absolute right-0 -bottom-[39.5px] left-0 h-10"
          />
        </div>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 -mb-15 flex-1 px-10 pb-10"
        >
          <Outlet />
        </motion.main>

        {/* Bottom Scroll Shadow */}
        <div
          style={{ backgroundImage: flippedScrimGradient }}
          className="pointer-events-none sticky -bottom-[0.5px] z-20 h-10 w-full shrink-0"
        />
      </div>
    </div>
  );
}
