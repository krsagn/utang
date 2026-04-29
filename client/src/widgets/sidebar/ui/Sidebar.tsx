import { useState } from "react";
import { cn } from "@/shared/lib";
import { ChevronLeft } from "lucide-react";
import { LogoutDialog } from "@/features/auth";
import { NavLink } from "react-router-dom";
import { motion, type Transition } from "framer-motion";
import { useFriendsSidebar } from "@/widgets/friends-sidebar";
import { useDebts } from "@/entities/debt";

type SidebarLink = {
  path?: string;
  action?: "toggleFriends";
  label: string;
  badge?: number;
};

// badge is now dynamic — not defined here
const SIDEBAR_LINKS: SidebarLink[] = [
  { path: "/board", label: "My Board" },
  { path: "/debts/outgoing", label: "To Pay" },
  { path: "/debts/incoming", label: "To Receive" },
  { path: "/debts/history", label: "History" },
  { action: "toggleFriends", label: "Friends" },
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
    <motion.button
      type="button"
      aria-label="Toggle sidebar"
      aria-expanded={!collapsed}
      animate={{ x: collapsed ? 96 : 0 }}
      transition={TWEEN_TRANSITION}
      className="group focus-visible:ring-primary/30 flex h-8 cursor-pointer items-center gap-5 rounded-sm pl-2 outline-none select-none focus-visible:ring-2"
      onClick={() => setCollapsed(!collapsed)}
    >
      <span className="font-display text-2xl font-semibold">u!</span>
      <motion.div
        animate={{ rotate: collapsed ? 180 : 0 }}
        transition={TWEEN_TRANSITION}
        className="text-primary opacity-30 transition-opacity duration-300 group-hover:opacity-100"
      >
        <ChevronLeft className="size-4" />
      </motion.div>
    </motion.button>
  );
}

// fades out and kills pointer events so links aren't clickable while hidden
function SidebarNav({ collapsed }: { collapsed: boolean }) {
  // fetch live counts for debt badges — same query key as DebtCarousel so no extra request is fired
  const { data: outgoing } = useDebts("pay", "pending");
  const { data: incoming } = useDebts("receive", "pending");

  // map path -> badge count, only show when > 0
  const badgeCounts: Record<string, number | undefined> = {
    "/debts/outgoing": outgoing?.length || undefined,
    "/debts/incoming": incoming?.length || undefined,
  };

  return (
    <motion.nav
      animate={{ opacity: collapsed ? 0 : 1 }}
      transition={FADE_TRANSITION}
      style={{ pointerEvents: collapsed ? "none" : "auto" }}
      className="text-primary my-auto flex w-full flex-col justify-center space-y-6 text-xs tracking-wider whitespace-nowrap"
    >
      {SIDEBAR_LINKS.map((link) => (
        <SidebarNavItem
          key={link.label}
          collapsed={collapsed}
          link={{
            ...link,
            badge: link.path ? badgeCounts[link.path] : undefined,
          }}
        />
      ))}
    </motion.nav>
  );
}

// one link: handles active styles, badge, and layout
function SidebarNavItem({
  link,
  collapsed,
}: {
  link: SidebarLink;
  collapsed: boolean;
}) {
  const { toggleSidebar, isOpen } = useFriendsSidebar();

  if (link.action === "toggleFriends") {
    return (
      <button
        type="button"
        onClick={toggleSidebar}
        tabIndex={collapsed ? -1 : 0}
        className={cn(
          "focus-visible:ring-primary/30 w-full cursor-pointer rounded-sm pl-2 text-left transition-all duration-300 outline-none focus-visible:ring-2",
          link.badge !== undefined &&
            "group flex items-center justify-between pr-1",
          isOpen
            ? "font-bold opacity-100"
            : "font-medium opacity-50 hover:opacity-75 focus-visible:opacity-100",
        )}
      >
        <span>{link.label}</span>
        {link.badge !== undefined && (
          // stiffness 300 here vs 500 on the NavLink badge is intentional:
          // this button animates within a less-prominent action context
          <span className="bg-primary flex size-5 items-center justify-center rounded-full text-[10px] font-medium text-white">
            <motion.span
              key={link.badge}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {link.badge}
            </motion.span>
          </span>
        )}
      </button>
    );
  }

  return (
    <NavLink
      to={link.path!}
      tabIndex={collapsed ? -1 : 0}
      draggable={false}
      className={({ isActive }) =>
        cn(
          "focus-visible:ring-primary/30 rounded-sm pl-2 transition-all duration-300 outline-none focus-visible:ring-2",
          link.badge !== undefined &&
            "group flex items-center justify-between pr-1",
          isActive
            ? "font-bold opacity-100"
            : "font-medium opacity-50 hover:opacity-75 focus-visible:opacity-100",
        )
      }
    >
      <span>{link.label}</span>
      {link.badge !== undefined && (
        <span className="bg-primary flex size-5 items-center justify-center rounded-full text-[10px] font-normal tracking-tight text-white">
          <motion.span
            key={link.badge}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {link.badge}
          </motion.span>
        </span>
      )}
    </NavLink>
  );
}

// isolated so it can own useLogout directly without lifting it up
function SidebarLogout({ collapsed }: { collapsed: boolean }) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1 }}
        transition={FADE_TRANSITION}
        style={{ pointerEvents: collapsed ? "none" : "auto" }}
      >
        <button
          type="button"
          draggable={false}
          onClick={() => setIsLogoutDialogOpen(true)}
          tabIndex={collapsed ? -1 : 0}
          className="text-primary focus-visible:ring-primary/30 w-full cursor-pointer rounded-sm pl-2 text-left text-xs font-medium tracking-wider whitespace-nowrap opacity-50 transition-all duration-300 outline-none hover:opacity-75 focus-visible:opacity-100 focus-visible:ring-2"
        >
          Logout
        </button>
      </motion.div>
      <LogoutDialog
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
