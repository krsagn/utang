import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib";
import { Fragment } from "react";

const tabs = [
  { label: "Friends", path: "/friends" },
  { label: "Requests", path: "/friends/requests" },
] as const;

export function FriendsTabs() {
  const { pathname } = useLocation();

  return (
    <div className="flex items-center gap-3">
      {tabs.map((tab, i) => (
        <Fragment key={tab.path}>
          {i > 0 && (
            <span className="font-heading text-2xl font-extrabold text-black/20">
              /
            </span>
          )}
          <Link
            to={tab.path}
            className={cn(
              "font-heading text-2xl font-extrabold transition-colors duration-200",
              pathname === tab.path
                ? "text-black"
                : "text-black/30 hover:text-black/50",
            )}
          >
            {tab.label}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
