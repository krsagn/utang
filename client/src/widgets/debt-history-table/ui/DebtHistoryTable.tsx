import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, cn } from "@/shared/lib";
import { useDebts } from "@/entities/debt";
import type { Debt } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { Spinner } from "@/shared/ui";

const GRID = "grid grid-cols-[1.5fr_1.25fr_1fr_1fr_1fr]";

const ANIMATION_DURATION = 0.7;

const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: ANIMATION_DURATION,
};

function matchesSearch(
  debt: Debt,
  query: string,
  currentUserId?: string,
): boolean {
  const q = query.toLowerCase();
  const otherParty =
    debt.lendeeId === currentUserId
      ? (debt.lenderFullName ?? debt.lenderName)
      : (debt.lendeeFullName ?? debt.lendeeName);
  return (
    otherParty.toLowerCase().includes(q) ||
    debt.title.toLowerCase().includes(q) ||
    (debt.description?.toLowerCase().includes(q) ?? false) ||
    debt.amount.includes(q)
  );
}

export function DebtHistoryTable() {
  const { data: debts, isLoading, error } = useDebts(undefined, "paid", true);
  const { data: currentUser, isLoading: sessionLoading } = useSession();

  const [search, setSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const filtered =
    debts && search.trim()
      ? debts.filter((d) => matchesSearch(d, search, currentUser?.id))
      : (debts ?? []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollLeft,
        scrollWidth,
        clientWidth,
      } = el;
      const epsilon = 1;

      const hasVerticalOverflow = scrollHeight - clientHeight > epsilon;
      setShowTopGradient(hasVerticalOverflow && scrollTop > epsilon);
      setShowBottomGradient(
        hasVerticalOverflow &&
          scrollTop + clientHeight < scrollHeight - epsilon,
      );

      const hasHorizontalOverflow = scrollWidth - clientWidth > epsilon;
      setShowLeftGradient(hasHorizontalOverflow && scrollLeft > epsilon);
      setShowRightGradient(
        hasHorizontalOverflow &&
          scrollLeft + clientWidth < scrollWidth - epsilon,
      );
    };

    update();
    const timer = setTimeout(update, ANIMATION_DURATION * 1000);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [filtered.length]);

  if (isLoading || sessionLoading)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="text-primary/50 size-6" />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-heading text-4xl font-extrabold tracking-wide">
          Uh oh!
        </p>
        <p className="text-primary/50 max-w-65 text-sm">
          We couldn't load your history. Try{" "}
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline underline-offset-4 opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            refreshing the page
          </button>
          .
        </p>
      </div>
    );

  if (!debts || debts.length === 0)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-heading text-4xl font-extrabold tracking-wide">
          All clear!
        </p>
        <p className="text-primary/50 max-w-65 text-sm">
          No settled debts yet. They'll show up here once you mark one as done.
        </p>
      </div>
    );

  return (
    <div className="mx-auto flex max-h-[calc(100vh-20rem)] max-w-156 flex-col gap-12">
      <motion.div
        layout="position"
        transition={TWEEN_TRANSITION}
        className="relative"
      >
        <Search className="text-primary/30 absolute top-1/2 left-3 size-3 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search history..."
          value={search}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "squircle border-primary/10 focus:border-primary/20 placeholder:text-primary/25 text-primary w-full border bg-transparent py-3 pr-3 pl-8 text-xs tracking-wide transition-colors outline-none",
            search && "font-medium",
          )}
        />
      </motion.div>

      <motion.div
        layout
        transition={TWEEN_TRANSITION}
        className="relative h-full min-h-0"
      >
        <div
          className={cn(
            "from-background pointer-events-none absolute top-5 right-0 left-0 z-10 h-12 bg-linear-to-b to-transparent transition-opacity duration-300",
            showTopGradient ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "from-background pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 bg-linear-to-t to-transparent transition-opacity duration-300",
            showBottomGradient ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6 bg-linear-to-r to-transparent transition-opacity duration-300",
            showLeftGradient ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-6 bg-linear-to-l to-transparent transition-opacity duration-300",
            showRightGradient ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={scrollRef}
          className="no-scrollbar flex h-full max-w-156 flex-col overflow-auto overscroll-none text-xs"
        >
          <motion.div
            layout
            transition={TWEEN_TRANSITION}
            className={cn(
              GRID,
              "bg-background text-primary sticky top-0 z-20 min-w-156 border-b pb-4 font-medium tracking-wide select-none",
            )}
          >
            <span>Other Party</span>
            <span>Amount</span>
            <span>Date Created</span>
            <span>Date Settled</span>
            <span>Created By</span>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filtered.map((debt) => {
              const isOutgoing = debt.lendeeId === currentUser?.id;
              const otherParty = isOutgoing
                ? (debt.lenderFullName ?? debt.lenderName)
                : (debt.lendeeFullName ?? debt.lendeeName);
              const isCreator = debt.createdBy === currentUser?.id;
              const originalIndex = debts.findIndex((d) => d.id === debt.id);

              return (
                <motion.div
                  key={debt.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: [1, 0, 0],
                    transition: { ...TWEEN_TRANSITION, times: [0, 0.3, 1] },
                  }}
                  transition={{
                    ...TWEEN_TRANSITION,
                    delay: originalIndex * 0.05,
                    layout: { ...TWEEN_TRANSITION, delay: 0 },
                  }}
                  className={cn(
                    GRID,
                    "bg-background min-w-156 border-b py-4 last:border-0",
                  )}
                >
                  <div className="pr-8">
                    <p className="font-semibold">{otherParty}</p>
                    <p className="text-primary/40 mt-0.5 line-clamp-1 italic">
                      {debt.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isOutgoing ? (
                      <ArrowUp className="text-outgoing size-4 shrink-0 stroke-[2.5px]" />
                    ) : (
                      <ArrowDown className="text-incoming size-4 shrink-0 stroke-[2.5px]" />
                    )}
                    <span
                      className={cn(
                        "font-bold",
                        isOutgoing ? "text-outgoing" : "text-incoming",
                      )}
                    >
                      {formatCurrency(debt.amount, debt.currency)}
                    </span>
                  </div>
                  <div className="text-primary/60 flex items-center">
                    {format(new Date(debt.createdAt), "MMM d, yyyy")}
                  </div>
                  <div className="text-primary/60 flex items-center">
                    {debt.updatedAt
                      ? format(new Date(debt.updatedAt), "MMM d, yyyy")
                      : "—"}
                  </div>
                  <div className="text-primary/60 flex items-center">
                    {isCreator
                      ? "You"
                      : debt.createdBy === debt.lenderId
                        ? (debt.lenderFullName ?? debt.lenderName)
                        : (debt.lendeeFullName ?? debt.lendeeName)}
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <motion.div
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary/40 py-12 text-center text-xs tracking-wide"
              >
                No debts match your search.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
