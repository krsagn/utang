import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
} from "date-fns";
import { useFriendsSidebar } from "../model/useFriendsSidebar";
import {
  useFriends,
  useFriendStats,
  type Friendship,
} from "@/entities/friendship";
import {
  X,
  Check,
  Plus,
  ChevronLeft,
  Ellipsis,
  UserRoundX,
  ArrowUp,
  ArrowDown,
  Pointer,
  Hourglass,
  ChevronDownIcon,
} from "lucide-react";
import axios from "axios";
import { useAcceptFriend } from "@/features/friendship/accept-friend/model/useAcceptFriend";
import { useDeleteFriend } from "@/features/friendship/delete-friend/model/useDeleteFriend";
import { useModal, cn, formatCompactCurrency } from "@/shared/lib";
import { AddFriendSearch } from "@/features/friendship/add-friend";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { RemoveFriendDialog } from "@/features/friendship/delete-friend";
import { Link } from "react-router-dom";
import { useNudgeFriend } from "@/features/friendship/nudge-friend";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;
const accordionTransition = (open: boolean) => ({
  duration: 0.5,
  ease,
  opacity: { duration: open ? 1 : 0.5, ease },
});

function SectionHeader({
  label,
  count,
  open,
  onToggle,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.h3
      layout="position"
      className="text-primary/30 flex cursor-pointer items-center gap-2 text-xs font-medium tracking-wide"
      onClick={onToggle}
    >
      {label}
      <span className="text-primary/20 select-none">|</span>
      {count}
      <ChevronDownIcon
        className={cn(
          "text-primary/30 ml-1 size-3 stroke-[2.25px] transition-[rotate] duration-500",
          open && "rotate-180",
        )}
      />
    </motion.h3>
  );
}

const NUDGE_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  opacity: { type: "tween", duration: 0.08 },
} as const;

function AccordionContent({
  open,
  onUpdate,
  children,
}: {
  open: boolean;
  onUpdate: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={accordionTransition(open)}
      onUpdate={onUpdate}
      style={{ overflow: "hidden" }}
      className="flex flex-col gap-6 md:pr-6"
    >
      {children}
    </motion.div>
  );
}

export function FriendsSidebar() {
  const { closeSidebar, isOpen } = useFriendsSidebar();

  const { data: acceptedFriends } = useFriends("accepted");
  const { data: pendingRequests } = useFriends("pending");
  const modal = useModal();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  const [requestsOpen, setRequestsOpen] = useState(true);
  const [friendsOpen, setFriendsOpen] = useState(true);

  const updateGradientVisibility = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasOverflow = scrollHeight - clientHeight > 1;
    if (!hasOverflow) {
      setShowTopGradient(false);
      setShowBottomGradient(false);
      return;
    }
    const epsilon = 1;
    setShowTopGradient(scrollTop > epsilon);
    setShowBottomGradient(scrollTop + clientHeight < scrollHeight - epsilon);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(updateGradientVisibility);
    el.addEventListener("scroll", updateGradientVisibility, { passive: true });
    window.addEventListener("resize", updateGradientVisibility);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", updateGradientVisibility);
      window.removeEventListener("resize", updateGradientVisibility);
    };
  }, [
    isOpen,
    acceptedFriends?.length,
    pendingRequests?.length,
    updateGradientVisibility,
  ]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "-100%" }}
          transition={{
            type: "tween",
            ease: [0.42, 0, 0.58, 1],
            duration: 0.6,
          }}
          className="text-primary absolute top-0 left-0 z-50 flex h-full w-full shrink-0 flex-col justify-between gap-15 p-7 md:w-80"
        >
          {/* Top Action */}
          <div
            onClick={() => modal.open("add-friend")}
            className="text-primary/50 hover:text-primary/80 flex w-fit cursor-pointer items-center gap-3 text-xs font-medium tracking-wider transition-colors duration-300"
          >
            <Plus className="size-3 stroke-[2.5px]" />
            <span>Add Friend</span>
          </div>

          <div className="relative min-h-0">
            <div
              ref={scrollContainerRef}
              className="no-scrollbar h-full overflow-y-auto"
            >
              <div className="flex flex-col gap-10">
                <AnimatePresence>
                  {/* Requests Section */}
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <motion.div
                      key="requests-section"
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "tween", duration: 0.2 }}
                      className="flex flex-col gap-5"
                    >
                      <SectionHeader
                        label="Requests"
                        count={pendingRequests.length}
                        open={requestsOpen}
                        onToggle={() => setRequestsOpen(!requestsOpen)}
                      />
                      <AccordionContent
                        open={requestsOpen}
                        onUpdate={updateGradientVisibility}
                      >
                        {pendingRequests.map((f) => (
                          <motion.div
                            layout="position"
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <RequestItem request={f} />
                          </motion.div>
                        ))}
                      </AccordionContent>
                    </motion.div>
                  ) : null}

                  {/* Friends Section */}
                  {acceptedFriends && acceptedFriends.length > 0 ? (
                    <motion.div
                      key="friends-section"
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "tween", duration: 0.2 }}
                      className="flex flex-col gap-5"
                    >
                      <SectionHeader
                        label="Friends"
                        count={acceptedFriends.length}
                        open={friendsOpen}
                        onToggle={() => setFriendsOpen(!friendsOpen)}
                      />
                      <AccordionContent
                        open={friendsOpen}
                        onUpdate={updateGradientVisibility}
                      >
                        {acceptedFriends.map((f) => (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex justify-between"
                          >
                            <AcceptedFriendItem friendship={f} />
                          </motion.div>
                        ))}
                      </AccordionContent>
                    </motion.div>
                  ) : null}

                  {/* Empty state: shown when both lists are empty */}
                  {!pendingRequests?.length && !acceptedFriends?.length && (
                    <motion.p
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "tween", duration: 0.2 }}
                      className="text-primary/30 text-xs tracking-wide"
                    >
                      No friends yet. Add one above.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div
              aria-hidden
              className={cn(
                "from-background pointer-events-none absolute top-0 right-0 left-0 h-15 bg-linear-to-b to-transparent transition-opacity duration-200",
                showTopGradient ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              className={cn(
                "from-background pointer-events-none absolute right-0 bottom-0 left-0 h-15 bg-linear-to-t to-transparent transition-opacity duration-200",
                showBottomGradient ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          {/* Bottom Action */}
          <div>
            <button
              onClick={closeSidebar}
              className="text-primary/50 hover:text-primary/80 flex w-fit cursor-pointer items-center gap-2.5 text-xs font-medium tracking-wider transition-colors duration-300"
            >
              <ChevronLeft className="size-3 stroke-[2.5px]" />
              <span>Back</span>
            </button>
          </div>

          {/* AnimatePresence here lets Modal's exit animations run before unmounting */}
          <AnimatePresence>
            {modal.hasActiveModal && <AddFriendSearch onClose={modal.close} />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function compactAge(date: Date): string {
  const now = new Date();
  const years = differenceInYears(now, date);
  if (years >= 1) return `${years}y`;
  const months = differenceInMonths(now, date);
  if (months >= 1) return `${months}mo`;
  const weeks = differenceInWeeks(now, date);
  if (weeks >= 1) return `${weeks}w`;
  const days = differenceInDays(now, date);
  if (days >= 1) return `${days}d`;
  const hours = differenceInHours(now, date);
  return `${Math.max(1, hours)}h`;
}

function NetBalanceValue({ amount }: { amount: number }) {
  if (amount === 0)
    return <Check className="text-primary/40 size-3.5 stroke-[2.5px]" />;

  const isPositive = amount > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-semibold tabular-nums",
        isPositive ? "text-incoming" : "text-outgoing",
      )}
    >
      {isPositive ? (
        <ArrowDown className="size-3 stroke-[2.5px]" />
      ) : (
        <ArrowUp className="size-3 stroke-[2.5px]" />
      )}
      ${Math.abs(amount)}
    </span>
  );
}

function AcceptedFriendItem({ friendship }: { friendship: Friendship }) {
  const { isOpen: sidebarOpen, closeSidebar } = useFriendsSidebar();

  const {
    mutate: handleNudge,
    isPending: nudgePending,
    isSuccess: nudgeSuccess,
    reset: resetNudge,
  } = useNudgeFriend();

  const [isOpen, setIsOpen] = useState(false);
  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const { data: stats, isPending } = useFriendStats(friendship.id, isOpen);
  const longestOwed = stats?.longestOwed;
  const fullName = `${friendship.friendFirstName} ${friendship.friendLastName}`;

  useEffect(() => {
    if (!nudgeSuccess) return;
    const t = setTimeout(() => resetNudge(), 1500);
    return () => clearTimeout(t);
  }, [nudgeSuccess, resetNudge]);

  return (
    <>
      <Popover open={isOpen && sidebarOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col justify-center tracking-wide">
          <span className="text-primary mb-1 text-xs leading-tight font-semibold">
            {fullName}
          </span>
          <span className="text-primary/50 text-xs font-medium">
            @{friendship.friendUsername}
          </span>
        </div>
        <PopoverTrigger asChild>
          <button
            aria-label={`Options for ${fullName}`}
            className="text-primary/50 hover:text-primary group flex size-6 items-center justify-center transition-all duration-300 outline-none enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Ellipsis className="transition-scale size-4 stroke-[2.5px] duration-300 group-hover:scale-90" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="squircle-dialog relative flex w-75 flex-col justify-between gap-4 bg-white/30 p-4.5 backdrop-blur-xs transition-colors duration-400 hover:bg-white/45"
          side="right"
          sideOffset={16}
          align="start"
          alignOffset={-13}
        >
          <div className="flex justify-between">
            <div className="flex flex-col justify-center tracking-wide">
              <p className="text-primary text-xs font-semibold">{fullName}</p>
              <p className="text-primary/50 text-xs font-medium">
                @{friendship.friendUsername}
              </p>
            </div>
            <div className="flex translate-x-0.5 -translate-y-px gap-1.5">
              <button
                aria-label={
                  nudgeSuccess ? `Nudged ${fullName}` : `Nudge ${fullName}`
                }
                aria-busy={nudgePending}
                disabled={nudgePending || nudgeSuccess}
                className={cn(
                  "group transition-scale flex size-6 items-center justify-center duration-300 outline-none hover:scale-96 enabled:cursor-pointer disabled:cursor-not-allowed",
                  nudgePending && "animate-pulse",
                )}
                onClick={() =>
                  handleNudge(friendship.id, {
                    onError: (error) => {
                      if (
                        axios.isAxiosError(error) &&
                        error.response?.status === 429
                      ) {
                        const seconds = error.response.data?.retryAfter;
                        const wait = seconds
                          ? seconds >= 60
                            ? `~${Math.ceil(seconds / 60)}min`
                            : `${seconds}s`
                          : null;

                        toast.error(`Slow down on ${fullName}!`, {
                          description: wait
                            ? `You've nudged them recently. Try again in ${wait}.`
                            : `You've nudged them recently. Try again later.`,
                          icon: (
                            <Hourglass className="size-4 animate-pulse opacity-80" />
                          ),
                        });
                        return;
                      }
                      toast.error(`Couldn't nudge ${fullName}`, {
                        description: "Give it another go in a moment.",
                      });
                    },
                  })
                }
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {nudgeSuccess ? (
                    <motion.span
                      key="nudge-check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.2, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={NUDGE_TRANSITION}
                    >
                      <Check className="text-primary size-4 stroke-[2.25px]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="nudge-pointer"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={NUDGE_TRANSITION}
                    >
                      <Pointer className="text-primary size-4 stroke-[2.25px] opacity-40 transition-opacity duration-300 group-hover:opacity-80" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                aria-label={`Remove ${fullName}`}
                className="group transition-scale flex size-6 items-center justify-center duration-300 outline-none hover:scale-96 enabled:cursor-pointer"
                onClick={() => setRemoveFriendDialogOpen(true)}
              >
                <UserRoundX className="text-primary size-4 stroke-[2.25px] opacity-40 transition-opacity duration-300 group-hover:opacity-80" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col gap-1.5 transition-opacity",
              isPending && "pointer-events-none opacity-40 select-none",
              !stats && "select-none",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-primary/40 text-xs tracking-wide">
                Net Balance
              </p>
              {stats ? (
                <NetBalanceValue amount={stats.netBalance} />
              ) : (
                <span className="text-primary/40 text-xs font-semibold tracking-wide tabular-nums">
                  --
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-primary/40 text-xs tracking-wide">
                Total Settled Debts
              </p>
              <p className="text-primary/40 text-xs font-semibold tracking-wide tabular-nums">
                {stats ? stats.settledDebtCount : "--"}
              </p>
            </div>
            {longestOwed && (
              <div className="flex items-center justify-between">
                <Link
                  className="text-primary/40 hover:text-primary/50 cursor-pointer text-xs tracking-wide underline decoration-transparent underline-offset-3 transition-[text-decoration-color,color,scale] duration-300 hover:scale-99 hover:decoration-current/50"
                  to={`/debts/${longestOwed.direction}?debtId=${longestOwed.id}`}
                  onClick={closeSidebar}
                >
                  Oldest Open Debt
                </Link>
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold tabular-nums",
                    longestOwed.direction === "incoming"
                      ? "text-incoming"
                      : "text-outgoing",
                  )}
                >
                  {longestOwed.direction === "incoming" ? (
                    <ArrowDown className="size-3 stroke-[2.5px]" />
                  ) : (
                    <ArrowUp className="size-3 stroke-[2.5px]" />
                  )}
                  {formatCompactCurrency(
                    longestOwed.amount,
                    longestOwed.currency,
                  )}
                  <div className="mx-0.5 size-0.5 shrink-0 self-center rounded-full bg-current opacity-50" />
                  <span className="animate-pulse">
                    {compactAge(new Date(longestOwed.since))}
                  </span>
                </span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <RemoveFriendDialog
        open={removeFriendDialogOpen}
        friendshipId={friendship.id}
        friendName={fullName}
        onCancel={() => {
          setRemoveFriendDialogOpen(false);
          setIsOpen(true);
        }}
        onSuccess={() => setRemoveFriendDialogOpen(false)}
      />
    </>
  );
}

function RequestItem({ request }: { request: Friendship }) {
  const { mutate: acceptFriend, isPending: isAccepting } = useAcceptFriend();
  const { mutate: rejectFriend, isPending: isRejecting } =
    useDeleteFriend("pending");

  const isPending = isAccepting || isRejecting;

  return (
    <div
      className={cn(
        "flex items-center justify-between tracking-wide",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex flex-col justify-center">
        <span className="text-primary/50 mb-1 text-xs leading-tight font-bold">
          {request.friendFirstName} {request.friendLastName}
        </span>
        <span className="text-primary/30 text-xs font-medium">
          @{request.friendUsername}
        </span>
      </div>
      <div className="flex items-center">
        <Tooltip delayDuration={2000}>
          <TooltipTrigger asChild>
            <button
              onClick={() => acceptFriend(request.id)}
              disabled={isPending}
              aria-label="Accept friend request"
              className="text-primary flex size-6 items-center justify-center opacity-50 transition-[scale,opacity] duration-300 outline-none hover:scale-90 hover:opacity-100 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"
            >
              <Check className="size-4 stroke-[2.5px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="pointer-events-none select-none"
          >
            Accept
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={2000}>
          <TooltipTrigger asChild>
            <button
              onClick={() => rejectFriend(request.id)}
              disabled={isPending}
              aria-label="Decline friend request"
              className="text-primary flex size-6 items-center justify-center opacity-50 transition-[scale,opacity] duration-300 outline-none hover:scale-90 hover:opacity-100 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"
            >
              <X className="size-4 stroke-[2.5px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="pointer-events-none select-none"
          >
            Decline
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
