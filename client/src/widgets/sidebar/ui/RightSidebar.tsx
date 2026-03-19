import { cn } from "@/shared/lib";
import { Search } from "lucide-react";
import {
  NavLink,
  useLocation,
  useMatch,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion, type Transition } from "framer-motion";
import { useState } from "react";
import { DeleteDebtDialog } from "@/features/debt/delete-debt";
import { useDebt, type Debt } from "@/entities/debt";
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
  const editMatch = useMatch("/debts/:debtId/edit");
  // On the edit page the debtId lives in the path, not the search params.
  const activeDebtId =
    searchParams.get("debtId") ?? editMatch?.params.debtId ?? undefined;
  const navigate = useNavigate();

  const { data: currentUser } = useSession();
  const { data: activeDebt } = useDebt(activeDebtId ?? "");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isCreator = activeDebt
    ? activeDebt?.createdBy === currentUser?.id
    : false;

  const handleDeleted = () => {
    // Only intercept and explicitly navigate if they were on the edit page
    if (editMatch && currentUser && activeDebt) {
      const type = currentUser.id === activeDebt.lendeeId ? "pay" : "receive";
      navigate(type === "receive" ? "/debts/incoming" : "/debts/outgoing");
    }
  };

  return (
    <motion.aside
      initial={{ x: "110%" }}
      animate={{ x: 0 }}
      transition={TWEEN_TRANSITION}
      className="relative z-30 flex w-48 shrink-0 flex-col justify-between bg-transparent px-6 py-7 text-[#333]"
    >
      <RightSidebarSearch />
      <RightSidebarNav
        activeDebtId={activeDebtId}
        activeDebt={activeDebt}
        currentUser={currentUser}
        isCreator={isCreator}
        openDeleteDialog={() => setIsDeleteDialogOpen(true)}
      />
      <RightSidebarSettings />

      {activeDebtId && (
        <DeleteDebtDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          debtId={activeDebtId}
          onDeleted={handleDeleted}
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
  activeDebtId,
  activeDebt,
  currentUser,
  isCreator,
  openDeleteDialog,
}: {
  activeDebtId: string | undefined;
  activeDebt: Debt | undefined | null;
  currentUser: { id: string } | undefined | null;
  isCreator: boolean;
  openDeleteDialog: () => void;
}) {
  const location = useLocation();
  const hasActiveDebt = !!activeDebtId;
  const canMutate = hasActiveDebt && isCreator;

  // useMatch resolves active state as a plain boolean so that NavLink's className
  // can be a string — required for Radix asChild (cloneElement can't call a function className).
  const isEditActive = !!useMatch(
    activeDebtId ? `/debts/${activeDebtId}/edit` : "__never__",
  );

  const activeDebtType =
    activeDebt && currentUser?.id
      ? currentUser.id === activeDebt.lendeeId
        ? "pay"
        : "receive"
      : undefined;

  const isOnOutgoingPage = location.pathname.startsWith("/debts/outgoing");
  const isOnIncomingPage = location.pathname.startsWith("/debts/incoming");
  const createInitialType = isOnIncomingPage
    ? "receive"
    : isOnOutgoingPage
      ? "pay"
      : (activeDebtType ?? "pay");

  return (
    <nav className="text-primary my-auto flex w-full flex-col items-end justify-center space-y-6 text-right text-xs tracking-wider whitespace-nowrap">
      <NavLink
        to="/debts/new"
        state={{ initialType: createInitialType }}
        className={({ isActive }) =>
          cn(
            "pr-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
            isActive
              ? "font-bold opacity-100"
              : "font-medium opacity-50 hover:opacity-75 focus-visible:opacity-100",
          )
        }
      >
        <span>Create Debt</span>
      </NavLink>
      <Tooltip open={hasActiveDebt && !isCreator ? undefined : false}>
        <TooltipTrigger asChild>
          <NavLink
            to={activeDebtId ? `/debts/${activeDebtId}/edit` : "/debts"}
            aria-disabled={!canMutate}
            tabIndex={canMutate ? undefined : -1}
            onClick={(e) => {
              if (!canMutate) e.preventDefault();
            }}
            className={cn(
              "pr-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
              !canMutate
                ? "pointer-events-none cursor-not-allowed opacity-20"
                : isEditActive
                  ? "font-bold opacity-100"
                  : "font-medium opacity-50 hover:opacity-75 focus-visible:opacity-100",
            )}
          >
            <span>Edit Debt</span>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="left">
          Only the creator can edit this debt
        </TooltipContent>
      </Tooltip>
      <Tooltip open={hasActiveDebt && !isCreator ? undefined : false}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={openDeleteDialog}
            disabled={!canMutate}
            className={cn(
              "pr-2 font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm focus-visible:opacity-100",
              canMutate
                ? "cursor-pointer opacity-50 hover:opacity-75"
                : "cursor-not-allowed opacity-20",
            )}
          >
            <span>Delete Debt</span>
          </button>
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
            "text-primary block cursor-pointer px-2 text-xs font-medium tracking-wider whitespace-nowrap transition-all duration-300",
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
