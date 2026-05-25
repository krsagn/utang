import { cn, useBreakpoint } from "@/shared/lib";
import { Bolt, Pen, Plus, Search, Trash } from "lucide-react";
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
import { useSidebarCollapsed } from "../model/useSidebarCollapsed";

// shared transition preset to stay visually synced with the left sidebar
const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.7,
};

export function RightSidebar() {
  // routing
  const [searchParams] = useSearchParams();
  const editMatch = useMatch("/debts/:debtId/edit");
  const activeDebtId =
    searchParams.get("debtId") ?? editMatch?.params.debtId ?? undefined;
  const navigate = useNavigate();

  // store & data
  const { collapsed } = useSidebarCollapsed();
  const { data: currentUser } = useSession();
  const { data: activeDebt } = useDebt(activeDebtId ?? "");

  // local state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // derived
  const isCreator = activeDebt
    ? activeDebt.createdBy === currentUser?.id
    : false;

  const handleDeleted = () => {
    if (editMatch && currentUser && activeDebt) {
      const type = currentUser.id === activeDebt.lendeeId ? "pay" : "receive";
      navigate(type === "receive" ? "/debts/incoming" : "/debts/outgoing");
    }
  };

  return (
    <motion.aside
      initial={{ x: "110%" }}
      animate={{ x: 0, marginRight: collapsed ? -96 : 0 }}
      transition={TWEEN_TRANSITION}
      className="relative z-30 flex shrink-0 flex-col justify-between bg-transparent px-6 py-7 text-[#333] md:w-48"
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
    <div className="flex h-8 items-center justify-end pr-2 select-none">
      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild>
          <div className="-mt-2 -mr-2">
            <NavLink
              to="/debts/search"
              aria-label="Search debts"
              className={({ isActive }) =>
                cn(
                  "text-primary cursor-pointer rounded-xl p-2 transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-30 hover:opacity-100",
                )
              }
              draggable={false}
            >
              <Search className="size-5" />
            </NavLink>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="tracking-wide" sideOffset={5}>
          Search debts
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

const NAV_VARIANTS = {
  rest: { x: 2, opacity: 0 },
  hover: { x: 0, opacity: 1 },
  persistent: { x: 0, opacity: 1 },
};

const NAV_ICON_TRANSITION = { ...TWEEN_TRANSITION, opacity: { duration: 0.2 } };

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
  // routing & layout
  const location = useLocation();
  const isMd = useBreakpoint(768);
  const { collapsed } = useSidebarCollapsed();

  // local state
  const [focused, setFocused] = useState<string | null>(null);
  // string className required for Radix asChild, can't use a function here
  const isEditActive = !!useMatch(
    activeDebtId ? `/debts/${activeDebtId}/edit` : "__never__",
  );

  // derived
  const hasActiveDebt = !!activeDebtId;
  const canMutate = hasActiveDebt && isCreator;
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
    <motion.nav
      animate={{ opacity: collapsed ? 0 : 1 }}
      className="text-primary my-auto flex w-full flex-col items-end justify-center text-right text-xs tracking-wider whitespace-nowrap"
    >
      <motion.div
        whileHover="hover"
        initial="rest"
        animate={
          isMd
            ? focused === "create"
              ? "hover"
              : location.pathname === "/debts/new"
                ? "hover"
                : "rest"
            : "persistent"
        }
      >
        <NavLink
          to="/debts/new"
          onFocus={() => setFocused("create")}
          onBlur={() => setFocused(null)}
          draggable={false}
          state={{ initialType: createInitialType }}
          className={({ isActive }) =>
            cn(
              "focus-visible:ring-primary/30 flex w-full flex-row-reverse items-center gap-4 rounded-xl px-2 py-3 transition-all duration-300 outline-none focus-visible:ring-2",
              isActive
                ? "font-bold opacity-100"
                : "font-medium opacity-50 hover:opacity-75 focus-visible:opacity-100",
            )
          }
        >
          <span className="hidden md:flex">Create Debt</span>
          <motion.span variants={NAV_VARIANTS} transition={NAV_ICON_TRANSITION}>
            <Plus className="size-4 stroke-2 md:size-3 md:stroke-[2.5px]" />
          </motion.span>
        </NavLink>
      </motion.div>
      <Tooltip open={hasActiveDebt && !isCreator ? undefined : false}>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={canMutate ? "hover" : undefined}
            initial="rest"
            animate={
              isMd
                ? focused === "edit"
                  ? "hover"
                  : location.pathname === `/debts/${activeDebtId}/edit` &&
                      activeDebtId
                    ? "hover"
                    : "rest"
                : "persistent"
            }
          >
            <NavLink
              to={activeDebtId ? `/debts/${activeDebtId}/edit` : "/debts"}
              onFocus={() => setFocused("edit")}
              onBlur={() => setFocused(null)}
              draggable={false}
              aria-disabled={!canMutate}
              tabIndex={canMutate ? undefined : -1}
              onClick={(e) => {
                if (!canMutate) e.preventDefault();
              }}
              className={cn(
                "focus-visible:ring-primary/30 flex w-full flex-row-reverse items-center gap-4 rounded-xl px-2 py-3 font-medium transition-all duration-300 outline-none focus-visible:ring-2",
                !canMutate
                  ? "cursor-not-allowed opacity-20"
                  : isEditActive
                    ? "font-bold opacity-100"
                    : "font-medium opacity-50 hover:opacity-75 focus-visible:opacity-100",
              )}
            >
              <span className="hidden md:flex">Edit Debt</span>
              <motion.span
                variants={NAV_VARIANTS}
                transition={NAV_ICON_TRANSITION}
              >
                <Pen className="size-4 stroke-2 md:size-3 md:stroke-[2.5px]" />
              </motion.span>
            </NavLink>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="tracking-wide">
          Only the creator can edit this debt
        </TooltipContent>
      </Tooltip>
      <Tooltip open={hasActiveDebt && !isCreator ? undefined : false}>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={canMutate ? "hover" : undefined}
            initial="rest"
            animate={
              isMd ? (focused === "delete" ? "hover" : "rest") : "persistent"
            }
          >
            <button
              draggable={false}
              type="button"
              onFocus={() => setFocused("delete")}
              onBlur={() => setFocused(null)}
              onClick={() => {
                if (!canMutate) return;
                openDeleteDialog();
              }}
              aria-disabled={!canMutate}
              tabIndex={canMutate ? undefined : -1}
              className={cn(
                "focus-visible:ring-primary/30 flex w-full flex-row-reverse items-center gap-4 rounded-xl px-2 py-3 font-medium transition-all duration-300 outline-none focus-visible:opacity-100 focus-visible:ring-2",
                canMutate
                  ? "cursor-pointer opacity-50 hover:opacity-75"
                  : "cursor-not-allowed opacity-20",
              )}
            >
              <span className="hidden md:flex">Delete Debt</span>
              <motion.span
                variants={NAV_VARIANTS}
                transition={NAV_ICON_TRANSITION}
              >
                <Trash className="size-4 stroke-2 md:size-3 md:stroke-[2.5px]" />
              </motion.span>
            </button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="tracking-wide">
          Only the creator can delete this debt
        </TooltipContent>
      </Tooltip>
    </motion.nav>
  );
}

// bottom section: right-aligned settings button
function RightSidebarSettings() {
  const { collapsed } = useSidebarCollapsed();
  const isMd = useBreakpoint(768);

  return (
    <motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="text-right">
      <NavLink
        to="/settings"
        draggable={false}
        className={({ isActive }) =>
          cn(
            "text-primary -mb-3 flex cursor-pointer flex-row-reverse rounded-xl px-2 py-3 text-xs font-medium tracking-wider whitespace-nowrap transition-all duration-300",
            isActive
              ? "font-extrabold opacity-100"
              : "opacity-50 hover:opacity-75",
          )
        }
      >
        {isMd ? (
          <span>Settings</span>
        ) : (
          <Bolt className="size-4 stroke-2 md:size-3 md:stroke-[2.5px]" />
        )}
      </NavLink>
    </motion.div>
  );
}
