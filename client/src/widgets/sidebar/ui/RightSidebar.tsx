import { cn } from "@/shared/lib";
import { Search } from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion, type Transition } from "framer-motion";
import { useState } from "react";
import { DeleteDebtDialog } from "@/features/debt/delete-debt";
import { useDebt } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";

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

  const { data: currentUser } = useSession();
  const { data: activeDebt } = useDebt(activeDebtId ?? "");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();

  const isCreator = activeDebt
    ? activeDebt?.createdBy === currentUser?.id
    : false;

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
        isCreator={isCreator}
        openDeleteDialog={() => setIsDeleteDialogOpen(true)}
        navigateToEdit={() =>
          activeDebtId && navigate(`/debts/${activeDebtId}/edit`)
        }
      />
      <RightSidebarSettings />

      {activeDebtId && (
        <DeleteDebtDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          debtId={activeDebtId}
        />
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
            "text-primary transition-all duration-300",
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
  isCreator,
  openDeleteDialog,
  navigateToEdit,
}: {
  hasActiveDebt: boolean;
  isCreator: boolean;
  openDeleteDialog: () => void;
  navigateToEdit: () => void;
}) {
  const location = useLocation();
  const canMutate = hasActiveDebt && isCreator;

  const isOnOutgoingPage = location.pathname.startsWith("/debts/outgoing");
  const isOnIncomingPage = location.pathname.startsWith("/debts/incoming");
  const createInitialType = isOnIncomingPage
    ? "receive"
    : isOnOutgoingPage
      ? "pay"
      : "pay";

  return (
    <nav className="text-primary my-auto flex w-full flex-col items-end justify-center space-y-6 text-right text-xs tracking-wider whitespace-nowrap">
      <NavLink
        to="/debts/new"
        state={{ initialType: createInitialType }}
        className={({ isActive }) =>
          cn(
            "pr-2 transition-all duration-300",
            isActive
              ? "font-bold opacity-100"
              : "font-medium opacity-50 hover:opacity-75",
          )
        }
      >
        <span>Create Debt</span>
      </NavLink>
      <Tooltip open={hasActiveDebt && !isCreator ? undefined : false}>
        <TooltipTrigger asChild>
          <div
            onClick={canMutate ? navigateToEdit : undefined}
            className={cn(
              "w-fit px-2 font-medium transition-all duration-300",
              canMutate
                ? "cursor-pointer opacity-50 hover:opacity-75"
                : "cursor-not-allowed opacity-20",
            )}
          >
            <span>Edit Debt</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          Only the creator can edit this debt
        </TooltipContent>
      </Tooltip>
      <Tooltip open={hasActiveDebt && !isCreator ? undefined : false}>
        <TooltipTrigger asChild>
          <div
            onClick={canMutate ? openDeleteDialog : undefined}
            className={cn(
              "w-fit px-2 font-medium transition-all duration-300",
              canMutate
                ? "cursor-pointer opacity-50 hover:opacity-75"
                : "cursor-not-allowed opacity-20",
            )}
          >
            <span>Delete Debt</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          Only the creator can delete this debt
        </TooltipContent>
      </Tooltip>
    </nav>
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
            "text-primary block cursor-pointer pr-2 text-xs font-medium tracking-wider whitespace-nowrap transition-all duration-300",
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
