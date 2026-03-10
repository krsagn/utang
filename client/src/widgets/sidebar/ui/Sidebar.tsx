import { useState } from "react";
import { cn } from "@/shared/lib";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLogout } from "@/features/auth";
import { NavLink } from "react-router-dom";
import { motion, type Transition } from "framer-motion";

type SidebarLink = {
  path: string;
  label: string;
  badge?: number;
};

const SIDEBAR_LINKS: SidebarLink[] = [
  { path: "/home", label: "My Board" },
  { path: "/debts/outgoing", label: "To Pay", badge: 5 },
  { path: "/debts/incoming", label: "To Receive", badge: 2 },
  { path: "/friends", label: "Friends" },
];

// extracted so framer doesn't recreate these objects on every render
const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.7,
};

const FADE_TRANSITION: Transition = { duration: 0.3 };

// collapsed state lives here; subcomponents just receive it as a prop
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: "-110%" }}
      animate={{ x: 0, marginLeft: collapsed ? -96 : 0 }}
      transition={TWEEN_TRANSITION}
      className="relative z-30 flex w-48 shrink-0 flex-col justify-between bg-transparent px-6 py-7 text-[#333]"
    >
      <SidebarLogo collapsed={collapsed} setCollapsed={setCollapsed} />
      <SidebarNav collapsed={collapsed} />
      <SidebarLogout collapsed={collapsed} />
    </motion.aside>
  );
}

// slides right by the same amount the sidebar slides left, so it stays pinned
function SidebarLogo({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  return (
    <motion.div
      animate={{ x: collapsed ? 96 : 0 }}
      transition={TWEEN_TRANSITION}
      className="flex h-8 cursor-pointer items-center gap-5 pl-2 select-none"
      onClick={() => setCollapsed(!collapsed)}
    >
      <span className="font-display text-2xl font-semibold">u!</span>
      <div className="text-black opacity-30 transition-all hover:opacity-100">
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </div>
    </motion.div>
  );
}

// fades out and kills pointer events so links aren't clickable while hidden
function SidebarNav({ collapsed }: { collapsed: boolean }) {
  return (
    <motion.nav
      animate={{ opacity: collapsed ? 0 : 1 }}
      transition={FADE_TRANSITION}
      style={{ pointerEvents: collapsed ? "none" : "auto" }}
      className="my-auto flex w-full flex-col justify-center space-y-6 text-xs tracking-wider whitespace-nowrap text-black"
    >
      {SIDEBAR_LINKS.map((link) => (
        <SidebarNavItem key={link.path} link={link} />
      ))}
    </motion.nav>
  );
}

// one link: handles active styles, badge, and layout
function SidebarNavItem({ link }: { link: SidebarLink }) {
  return (
    <NavLink
      to={link.path}
      className={({ isActive }) =>
        cn(
          "pl-2 transition-all duration-300",
          link.badge !== undefined &&
            "group flex items-center justify-between pr-1",
          isActive
            ? "font-extrabold opacity-100"
            : "font-medium opacity-50 hover:opacity-75",
        )
      }
    >
      <span>{link.label}</span>
      {link.badge !== undefined && (
        <span className="flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
          {link.badge}
        </span>
      )}
    </NavLink>
  );
}

// isolated so it can own useLogout directly without lifting it up
function SidebarLogout({ collapsed }: { collapsed: boolean }) {
  const { mutate: performLogout } = useLogout();

  return (
    <motion.div
      animate={{ opacity: collapsed ? 0 : 1 }}
      transition={FADE_TRANSITION}
      style={{ pointerEvents: collapsed ? "none" : "auto" }}
    >
      <div
        onClick={() => performLogout()}
        className="cursor-pointer pl-2 text-xs font-medium tracking-wider whitespace-nowrap text-black opacity-50 transition-all duration-300 hover:opacity-75"
      >
        Logout
      </div>
    </motion.div>
  );
}
