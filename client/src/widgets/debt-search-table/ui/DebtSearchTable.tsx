import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, cn } from "@/shared/lib";
import { useDebts } from "@/entities/debt";
import type { Debt } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { Spinner } from "@/shared/ui";

const GRID = "grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr]";

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

export function DebtSearchTable() {
  const {
    data: debts,
    isLoading,
    error,
  } = useDebts(undefined, "pending", true);
  const { data: currentUser, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();
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
    const timer = setTimeout(update, ANIMATION_DURATION * 1000 + 100);
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
          We couldn't load your debts. Try{" "}
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

  if (!debts || (debts.length === 0 && !search))
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-heading text-4xl font-extrabold tracking-wide">
          All clear!
        </p>
        <p className="text-primary/50 max-w-65 text-sm">
          No pending debts yet.{" "}
          <Link
            to="/debts/new"
            className="text-primary underline underline-offset-4 opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            Record one
          </Link>
          .
        </p>
      </div>
    );

  return (
    <div className="mx-auto flex max-h-[calc(100vh-20rem)] max-w-156 flex-col gap-12 tracking-wide">
      <motion.div
        layout="position"
        transition={TWEEN_TRANSITION}
        className="relative"
      >
        <Search className="text-primary/30 absolute top-1/2 left-3 size-3 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search debts..."
          value={search}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          onChange={(e) => setSearch(e.target.value)}
          maxLength={100}
          className={cn(
            "squircle border-primary/15 focus:border-primary/25 placeholder:text-primary/45 text-primary w-full border bg-transparent py-3 pr-3 pl-8 text-xs transition-colors outline-none",
            search && "font-medium",
          )}
        />
      </motion.div>

      <motion.div
        layout
        transition={TWEEN_TRANSITION}
        className={cn(
          "relative min-h-0 flex-1 text-xs",
          "no-scrollbar flex overflow-hidden",
        )}
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
            "from-background pointer-events-none absolute top-0 bottom-0 left-0 z-30 w-6 bg-linear-to-r to-transparent transition-opacity duration-300",
            showLeftGradient ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "from-background pointer-events-none absolute top-0 right-0 bottom-0 z-30 w-6 bg-linear-to-l to-transparent transition-opacity duration-300",
            showRightGradient ? "opacity-100" : "opacity-0",
          )}
        />

        <motion.div
          layout
          transition={TWEEN_TRANSITION}
          ref={scrollRef}
          className="no-scrollbar relative flex min-h-0 max-w-156 flex-1 flex-col overflow-auto overscroll-none text-xs hover:cursor-pointer"
        >
          <motion.div
            layout
            transition={TWEEN_TRANSITION}
            className={cn(
              GRID,
              "bg-background text-primary border-primary/10 sticky top-0 z-20 min-w-156 -translate-y-px border-b pb-4 font-medium select-none hover:cursor-default",
            )}
          >
            <span>Other Party</span>
            <span>Amount</span>
            <span>Date Created</span>
            <span>Deadline</span>
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
                <motion.a
                  key={debt.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  exit={{
                    opacity: [0.75, 0, 0],
                    transition: { ...TWEEN_TRANSITION, times: [0, 0.3, 1] },
                  }}
                  transition={{
                    ...TWEEN_TRANSITION,
                    delay: originalIndex * 0.03,
                    layout: { ...TWEEN_TRANSITION, delay: 0 },
                  }}
                  whileHover={{
                    scale: 0.995,
                    opacity: 1,
                    transition: {
                      ...TWEEN_TRANSITION,
                      delay: 0,
                      duration: 0.3,
                    },
                  }}
                  className={cn(
                    GRID,
                    "bg-background group border-primary/5 min-w-156 border-b py-4 last:border-0",
                  )}
                  href={`/debts/${isOutgoing ? "outgoing" : "incoming"}?debtId=${debt.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(
                      `/debts/${isOutgoing ? "outgoing" : "incoming"}?debtId=${debt.id}`,
                    );
                  }}
                >
                  <div className="pr-8">
                    <p className="font-semibold">{otherParty}</p>
                    <p className="text-primary/40 mt-0.5 line-clamp-1 break-all italic underline decoration-transparent underline-offset-2 transition-[text-decoration-color] duration-300 group-hover:decoration-current/50">
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
                    {format(new Date(debt.createdAt), "d MMM yyyy")}
                  </div>
                  <div
                    className={cn(
                      "text-primary/60 flex items-center",
                      !debt.deadline && "select-none",
                    )}
                  >
                    {debt.deadline
                      ? format(new Date(debt.deadline), "d MMM yyyy")
                      : "—"}
                  </div>
                  <div className="text-primary/60 flex items-center">
                    {isCreator
                      ? "You"
                      : debt.createdBy === debt.lenderId
                        ? (debt.lenderFullName ?? debt.lenderName)
                        : (debt.lendeeFullName ?? debt.lendeeName)}
                  </div>
                </motion.a>
              );
            })}
            {filtered.length === 0 && (
              <motion.div
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={TWEEN_TRANSITION}
                className="text-primary/40 py-12 text-center text-xs"
              >
                No debts match your search.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
