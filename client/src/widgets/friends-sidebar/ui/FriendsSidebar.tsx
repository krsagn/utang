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
} from "lucide-react";
import { useAcceptFriend } from "@/features/friendship/accept-friend/model/useAcceptFriend";
import { useDeleteFriend } from "@/features/friendship/delete-friend/model/useDeleteFriend";
import { useModal, cn, formatCompactCurrency } from "@/shared/lib";
import { AddFriendModal } from "@/features/friendship/add-friend";
import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";
import { RemoveFriendDialog } from "@/features/friendship/delete-friend";
import { Link } from "react-router-dom";

export function FriendsSidebar() {
  const { closeSidebar, isOpen } = useFriendsSidebar();

  const { data: acceptedFriends } = useFriends("accepted");
  const { data: pendingRequests } = useFriends("pending");
  const modal = useModal();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    const updateGradientVisibility = () => {
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
    };

    updateGradientVisibility();
    el.addEventListener("scroll", updateGradientVisibility, { passive: true });
    window.addEventListener("resize", updateGradientVisibility);

    return () => {
      el.removeEventListener("scroll", updateGradientVisibility);
      window.removeEventListener("resize", updateGradientVisibility);
    };
  }, [isOpen, acceptedFriends?.length, pendingRequests?.length]);

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
          className="text-primary absolute top-0 left-0 z-50 flex h-full w-80 shrink-0 flex-col justify-between gap-15 p-7"
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
                      <motion.h3
                        layout="position"
                        className="text-primary/30 flex items-center gap-2 text-xs font-medium tracking-wide"
                      >
                        Requests{" "}
                        <span className="text-primary/20 select-none">|</span>{" "}
                        {pendingRequests.length}
                      </motion.h3>
                      <div className="flex flex-col gap-6 pr-6">
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
                      </div>
                    </motion.div>
                  ) : null}

                  {/* Friends Section */}
                  <motion.div layout="position" className="flex flex-col gap-5">
                    <h3 className="text-primary/30 flex items-center gap-2 text-xs font-medium tracking-wide">
                      Friends{" "}
                      <span className="text-primary/20 select-none">|</span>{" "}
                      {acceptedFriends?.length || 0}
                    </h3>
                    <div className="flex flex-col gap-6 pr-6">
                      {acceptedFriends?.map((f) => (
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
                    </div>
                  </motion.div>
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
            {modal.hasActiveModal && <AddFriendModal onClose={modal.close} />}
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

  const [isOpen, setIsOpen] = useState(false);
  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const { data: stats, isPending } = useFriendStats(friendship.id, isOpen);
  const longestOwed = stats?.longestOwed;

  const fullName = `${friendship.friendFirstName} ${friendship.friendLastName}`;

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
          <button className="text-primary/50 hover:text-primary group flex size-6 items-center justify-center transition-all duration-300 outline-none enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
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
            <div className="flex translate-x-0.5 -translate-y-px gap-1">
              {/* TODO: nudge feature — POST /friendships/:id/nudge, socket + email notify */}
              <button className="group transition-scale flex size-6 items-center justify-center duration-300 outline-none hover:scale-96 enabled:cursor-pointer">
                <Pointer className="text-primary size-4 stroke-[2.25px] opacity-40 transition-opacity duration-300 group-hover:opacity-80" />
              </button>
              <button
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
                  <div className="size-0.5 shrink-0 self-center rounded-full bg-current px-0.5 opacity-50" />
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
        <button
          onClick={() => acceptFriend(request.id)}
          disabled={isPending}
          className="text-primary/50 hover:text-primary flex size-6 items-center justify-center transition-all duration-300 outline-none hover:scale-90 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="size-4 stroke-[2.5px]" />
        </button>
        <button
          onClick={() => rejectFriend(request.id)}
          disabled={isPending}
          className="text-primary/50 hover:text-primary flex size-6 items-center justify-center transition-all duration-300 outline-none hover:scale-90 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="size-4 stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
}
