import { cn } from "@/shared/lib";
import { Search } from "lucide-react";
import { NavLink, useSearchParams } from "react-router-dom";
import { motion, type Transition, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DeleteDebtDialog } from "@/features/debt/delete-debt";
import { EditDebtModal } from "@/features/debt/update-debt";

type SidebarLink = {
  path: string;
  label: string;
};

const CREATE_LINK: SidebarLink = { path: "/debts/new", label: "Create Debt" };

// shared transition preset to stay visually synced with the left sidebar
const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.7,
};

// static right sidebar; no collapsed state
export function RightSidebar() {
  const [searchParams] = useSearchParams();
  const activeDebtId = searchParams.get("debtId") ?? undefined;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <motion.aside
      initial={{ x: "110%" }}
      animate={{ x: 0 }}
      transition={TWEEN_TRANSITION}
      className="relative z-30 flex w-48 shrink-0 flex-col justify-between bg-transparent px-6 py-7 text-[#333]"
    >
      <RightSidebarSearch />
      <RightSidebarNav
        hasActiveDebt={!!activeDebtId}
        openDeleteDialog={() => setIsDeleteDialogOpen(true)}
        openEditModal={() => setIsEditModalOpen(true)}
      />
      <RightSidebarSettings />

      {activeDebtId && (
        <>
          <DeleteDebtDialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            debtId={activeDebtId}
          />
          <AnimatePresence>
            {isEditModalOpen && (
              <EditDebtModal
                onClose={() => setIsEditModalOpen(false)}
                debtId={activeDebtId}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </motion.aside>
  );
}

// top section: right-aligned search icon
function RightSidebarSearch() {
  return (
    <div className="flex h-8 cursor-pointer items-center justify-end pr-2 select-none">
      <NavLink
        to="/search"
        className={({ isActive }) =>
          cn(
            "text-black transition-all duration-300",
            isActive ? "opacity-100" : "opacity-30 hover:opacity-100",
          )
        }
      >
        <Search className="size-5" />
      </NavLink>
    </div>
  );
}

// middle section: full list of action routes aligned to the right edge
function RightSidebarNav({
  hasActiveDebt,
  openDeleteDialog,
  openEditModal,
}: {
  hasActiveDebt: boolean;
  openDeleteDialog: () => void;
  openEditModal: () => void;
}) {
  return (
    <nav className="my-auto flex w-full flex-col justify-center space-y-6 text-right text-xs tracking-wider whitespace-nowrap text-black">
      <RightSidebarNavItem link={CREATE_LINK} />
      <div
        onClick={hasActiveDebt ? openEditModal : undefined}
        className={cn(
          "pr-2 font-medium transition-all duration-300",
          hasActiveDebt
            ? "cursor-pointer opacity-50 hover:opacity-75"
            : "cursor-not-allowed opacity-20",
        )}
      >
        <span>Edit Debt</span>
      </div>
      <div
        onClick={hasActiveDebt ? openDeleteDialog : undefined}
        className={cn(
          "pr-2 font-medium transition-all duration-300",
          hasActiveDebt
            ? "cursor-pointer opacity-50 hover:opacity-75"
            : "cursor-not-allowed opacity-20",
        )}
      >
        <span>Delete Debt</span>
      </div>
    </nav>
  );
}

// single nav link; mirrors the exact font transitions from the left sidebar
function RightSidebarNavItem({ link }: { link: SidebarLink }) {
  return (
    <NavLink
      to={link.path}
      className={({ isActive }) =>
        cn(
          "pr-2 transition-all duration-300",
          isActive
            ? "font-bold opacity-100"
            : "font-medium opacity-50 hover:opacity-75",
        )
      }
    >
      <span>{link.label}</span>
    </NavLink>
  );
}

// bottom section: right-aligned settings button
function RightSidebarSettings() {
  return (
    <div className="text-right">
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            "block cursor-pointer pr-2 text-xs font-medium tracking-wider whitespace-nowrap text-black transition-all duration-300",
            isActive
              ? "font-extrabold opacity-100"
              : "opacity-50 hover:opacity-75",
          )
        }
      >
        Settings
      </NavLink>
    </div>
  );
}
