import { useState } from "react";
import { cn } from "@/shared/lib/utils";
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
    "flex font-bold items-center rounded-xl bg-sidebar transition-all duration-300 hover:scale-98 group opacity-40 hover:opacity-100",
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
        "bg-sidebar relative flex flex-col items-stretch justify-between p-6 transition-[width,padding,margin] duration-300",
        collapsed ? "w-24" : "w-64",
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-sidebar absolute top-12 -right-3 z-10 flex size-7 items-center justify-center rounded-full shadow-xl transition duration-300 hover:scale-110"
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
        {/* User Profile */}
        <div
          className={cn(
            "bg-sidebar border-sidebar-border mt-3 flex items-center rounded-2xl border text-xs tracking-wide transition-all duration-300",
            collapsed ? "w-12 border-none p-3" : "w-50 p-3",
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

        <hr className="border-sidebar-border mx-2 my-5 border-t" />

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
                  collapsed && "mb-4",
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
                  collapsed && "mb-4",
                )}
              >
                <SidebarButton item={item} collapsed={collapsed} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
