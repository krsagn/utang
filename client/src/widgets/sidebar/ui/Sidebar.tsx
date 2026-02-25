import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  HomeAngle,
  CardSend,
  CardReceive,
  UsersGroupRounded,
  Logout2,
  UserCircle,
  AltArrowLeft,
} from "@solar-icons/react";

import type { Icon } from "@solar-icons/react/lib/types";
import { useSession } from "@/entities/user";
import { useLogout } from "@/features/auth";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

interface SidebarItem {
  label: string;
  icon: Icon;
  path?: string;
  action?: () => void;
}

function SidebarButton({
  item,
  collapsed,
}: {
  item: SidebarItem;
  collapsed: boolean;
}) {
  return (
    <>
      <item.icon
        aria-hidden
        className={cn(
          "shrink-0 drop-shadow-md transition-all duration-300 group-hover:scale-105",
          collapsed ? "size-6" : "size-5",
        )}
        weight="BoldDuotone"
      />
      <span
        className={cn(
          "overflow-hidden text-xs tracking-wider whitespace-nowrap transition-all duration-300",
          collapsed ? "ml-0 max-w-0 opacity-0" : "ml-4 max-w-24 opacity-100",
        )}
      >
        {item.label}
      </span>
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: user } = useSession();
  const { mutate: performLogout } = useLogout();

  const buttonClasses = cn(
    "flex font-bold items-center rounded-xl transition-all duration-300 hover:scale-98 group opacity-40 hover:opacity-100",
    collapsed ? "w-12 p-3" : "w-50 p-3 hover:bg-sidebar-accent",
  );

  const handleLogout = () => {
    performLogout();
  };

  const upperItems: SidebarItem[] = [
    { label: "Home", icon: HomeAngle, path: "/home" },
    { label: "To Pay", icon: CardSend, path: "/debts/outgoing" },
    { label: "To Receive", icon: CardReceive, path: "/debts/incoming" },
    { label: "Friends", icon: UsersGroupRounded, path: "/friends" },
  ];

  const bottomItems: SidebarItem[] = [
    { label: "Logout", icon: Logout2, action: handleLogout },
  ];

  return (
    <motion.aside
      initial={{ x: "-110%" }}
      animate={{ x: 0 }}
      transition={{
        type: "tween",
        ease: [0.22, 1, 0.36, 1],
        duration: 0.7,
      }}
      className={cn(
        "bg-sidebar relative z-30 flex flex-col items-stretch justify-between p-6 shadow-xl transition-[width,padding,margin] duration-300",
        collapsed ? "w-24" : "w-64",
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-sidebar absolute top-12 -right-3 z-30 flex size-7 items-center justify-center rounded-full shadow-xl transition duration-300 hover:scale-110"
      >
        <AltArrowLeft
          className={cn(
            "size-4 transition-transform duration-300",
            collapsed && "rotate-180",
          )}
          weight="Bold"
        />
      </button>

      <div className="flex flex-col">
        {/* Logo */}
        <div
          className={cn(
            "mt-3 mb-5 flex items-center py-1 transition-all duration-300",
            collapsed ? "ml-1.5 w-12 scale-90" : "w-50 scale-100 px-3",
          )}
        >
          <h1
            className={cn(
              "font-display to-primary flex items-center bg-linear-to-tr from-[#6A7D13] bg-clip-text text-4xl font-semibold tracking-wide text-transparent select-none",
            )}
          >
            <span>u</span>
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-all duration-300",
                collapsed ? "max-w-0" : "max-w-[5ch]",
              )}
            >
              tang
            </span>
            <span className="text-primary bg-white">!</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex flex-col">
            {upperItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.path ?? "/"}
                  className={({ isActive }) =>
                    cn(
                      buttonClasses,
                      "mb-2 transition-all duration-300",
                      collapsed && "mb-4",
                      isActive && "opacity-100",
                    )
                  }
                >
                  <SidebarButton item={item} collapsed={collapsed} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col">
        {/* Bottom Actions */}
        <ul className="flex flex-col">
          {bottomItems.map((item) => (
            <li key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path ?? "/home"}
                  className={cn(
                    buttonClasses,
                    "mb-2 transition-all duration-300",
                  )}
                >
                  <SidebarButton item={item} collapsed={collapsed} />
                </NavLink>
              ) : (
                <button
                  onClick={item.action}
                  className={cn(
                    buttonClasses,
                    "mb-2 transition-all duration-300",
                    collapsed && "-ml-0.5",
                  )}
                >
                  <SidebarButton item={item} collapsed={collapsed} />
                </button>
              )}
            </li>
          ))}
        </ul>

        <hr className="border-sidebar-border my-3 border-t" />

        {/* User Profile */}
        <div
          className={cn(
            "bg-sidebar flex items-center rounded-2xl text-xs tracking-wide transition-all duration-300",
            collapsed ? "w-12 p-3" : "w-50 p-3",
          )}
        >
          <UserCircle
            aria-hidden
            color="black"
            className={cn(
              "shrink-0 drop-shadow-md transition-all duration-300",
              collapsed ? "size-6" : "size-8",
            )}
            weight="BoldDuotone"
          />
          <div
            className={cn(
              "flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300",
              collapsed
                ? "ml-0 max-w-0 opacity-0"
                : "ml-4 max-w-40 opacity-100",
            )}
          >
            <p className="font-bold whitespace-nowrap">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="whitespace-nowrap opacity-50">{user?.username}</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
