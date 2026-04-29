import { memo, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";

import {
  type Debt,
  type DebtType,
  useDebts,
  ReceiptCard,
} from "@/entities/debt";
import { useSession } from "@/entities/user";
import { useUpdateDebt } from "@/features/debt/update-debt";
import { formatCurrency, cn } from "@/shared/lib";
import { Spinner, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";
import { DebtContextMenu } from "@/widgets/debt-context-menu";

// module-level constants, not recreated on render
const mountSpring = { type: "spring", stiffness: 500, damping: 35 } as const;
const step = 0.06; // seconds between cascade segments

// pure function — no need to recreate inside the component on every render
const mountTransition = (segment: number, hasNavigated: boolean) => ({
  ...mountSpring,
  delay: hasNavigated ? 0 : segment * step,
});

// preload receipt image at module load, gate mount animations until it's ready
const receiptImg = new Image();
receiptImg.src = "/empty-receipt-alt2.png";

// memo'd so only the 2 cards whose isSelected changes re-render on navigation
const CarouselSlide = memo(function CarouselSlide({
  debt,
  index,
  isSelected,
  isOutgoing,
  isCreator,
  currentUserId,
  hasNavigated,
}: {
  debt: Debt;
  index: number;
  isSelected: boolean;
  isCreator: boolean;
  isOutgoing: boolean;
  currentUserId: string | undefined;
  hasNavigated: boolean;
}) {
  return (
    <motion.div
      className="flex-none basis-auto"
      initial={hasNavigated ? false : { opacity: 0.35, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.6,
        transition: {
          opacity: { duration: 0.08, ease: "linear" },
          scale: { duration: 0.3, ease: "easeOut" },
        },
      }}
      transition={{
        ...mountSpring,
        delay: index * 0.1,
        opacity: { duration: 0.5 },
      }}
    >
      <div
        className={cn(
          "transition-[scale,opacity] duration-300 ease-out",
          isSelected ? "scale-100 opacity-100" : "scale-85 opacity-40",
        )}
      >
        {isSelected ? (
          <DebtContextMenu debt={debt} isCreator={isCreator}>
            <ReceiptCard
              {...debt}
              isOutgoing={isOutgoing}
              currentUserId={currentUserId}
            />
          </DebtContextMenu>
        ) : (
          <ReceiptCard
            {...debt}
            isOutgoing={isOutgoing}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </motion.div>
  );
});

export function DebtCarousel({ type }: { type: DebtType }) {
  const { data: debts, isLoading, error } = useDebts(type, "pending");
  const { data: currentUser } = useSession();
  const { mutate: updateDebt, isPending: isMarkingDone } = useUpdateDebt();
  const isOutgoing = type === "pay";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    containScroll: false,
  });

  const [slide, setSlide] = useState<{ index: number; direction: 1 | -1 }>({
    index: 0,
    direction: 1,
  });
  const { index: selectedIndex, direction } = slide;
  const [hasNavigated, setHasNavigated] = useState(false); // false = mount anims, true = directional anims
  const [imageReady, setImageReady] = useState(() => receiptImg.complete); // lazy init reads .complete at first render, not module load
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isInitialSelectRef = useRef(true);
  const selectedIndexRef = useRef(0); // avoids stale closure when computing direction
  const debtsRef = useRef(debts); // always-fresh ref for use inside embla callbacks
  const reInitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialDebtId = useRef(searchParams.get("debtId"));

  useEffect(() => {
    debtsRef.current = debts;
  }, [debts]);

  // if image wasn't complete at first render, wait for it
  useEffect(() => {
    if (receiptImg.complete) return;
    const handleLoad = () => setImageReady(true);
    receiptImg.addEventListener("load", handleLoad);
    return () => receiptImg.removeEventListener("load", handleLoad);
  }, []);

  // sync selectedIndex + direction with Embla; push debtId to URL for sidebar
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const next = emblaApi.selectedScrollSnap();
      const dir = next > selectedIndexRef.current ? 1 : -1;
      selectedIndexRef.current = next;
      setSlide({ index: next, direction: dir });
      const debtId = debtsRef.current?.[next]?.id;
      if (debtId && !initialDebtId.current)
        navigate({ search: `?debtId=${debtId}` }, { replace: true });
      if (isInitialSelectRef.current) {
        isInitialSelectRef.current = false;
      } else {
        setHasNavigated(true);
      }
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, navigate]);

  // clamp selectedIndex when debts array shrinks (e.g. after deletion)
  const maxIndex = debts ? Math.max(debts.length - 1, 0) : 0;
  const clampedIndex = Math.min(selectedIndex, maxIndex);

  // correct state if it drifted (setState during render is fine as a self-correction)
  if (clampedIndex !== selectedIndex) {
    setSlide((prev) => ({ ...prev, index: clampedIndex }));
  }

  // sync ref + Embla to the clamped position (external system side-effects)
  useEffect(() => {
    selectedIndexRef.current = clampedIndex;
    if (emblaApi && clampedIndex !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(clampedIndex, true);
    }
  }, [clampedIndex, emblaApi]);

  // ensure URL stays fresh when debts array changes (e.g., deletion, mark as done)
  // this catches cases where Embla doesn't fire 'select' when the carousel repositions
  useEffect(() => {
    if (!debts || debts.length === 0 || initialDebtId.current) return;
    const currentDebt = debts[clampedIndex];
    if (currentDebt) {
      navigate({ search: `?debtId=${currentDebt.id}` }, { replace: true });
    }
  }, [debts, clampedIndex, navigate]);

  // reinit Embla after mount stagger settles so slide positions are accurate
  // if a debtId param was present, scroll to it after reInit when positions are correct
  useEffect(() => {
    if (!emblaApi || !debts) return;
    const totalDuration = debts.length * 50;
    reInitTimerRef.current = setTimeout(() => {
      emblaApi.reInit();
      if (initialDebtId.current) {
        const index = debts.findIndex((d) => d.id === initialDebtId.current);
        if (index !== -1) emblaApi.scrollTo(index);
        initialDebtId.current = null;
      }
    }, totalDuration);
    return () => {
      if (reInitTimerRef.current) clearTimeout(reInitTimerRef.current);
    };
  }, [emblaApi, debts]);

  if (isLoading || !imageReady)
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
  if (!debts || debts.length === 0)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-heading text-4xl font-extrabold tracking-wide">
          {isOutgoing ? "Nothing owed!" : "Nobody owes you."}
        </p>
        <p
          className={cn(
            "text-primary/50 text-sm",
            isOutgoing ? "max-w-65" : "max-w-xs",
          )}
        >
          {isOutgoing
            ? "You're in the clear. No debts to pay, enjoy it while it lasts."
            : "Looks like you're not owed anything. Time to lend a friend some cash."}{" "}
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

  const selectedDebt = debts[selectedIndex] ?? debts[0];
  const isCreator = selectedDebt.createdBy === currentUser?.id;
  const counterparty = isOutgoing
    ? selectedDebt.lenderName
    : selectedDebt.lendeeName;
  const deadline = selectedDebt.deadline
    ? new Date(selectedDebt.deadline)
    : null;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* hero summary */}
      <div className="flex flex-col items-center gap-1 text-center">
        {/* direction arrow */}
        <motion.img
          src={isOutgoing ? "/outgoing-arrow.svg" : "/incoming-arrow.svg"}
          alt=""
          aria-hidden
          className={cn("h-12 select-none", isOutgoing && "-mb-2")}
          initial={hasNavigated ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={mountTransition(3, hasNavigated)}
        />
        {/* amount — pops in on mount, slides directionally on navigation */}
        <div className="relative">
          <AnimatePresence
            mode="popLayout"
            custom={{ dir: direction, mounted: hasNavigated }}
          >
            <motion.div
              key={selectedIndex}
              layout="position"
              custom={{ dir: direction, mounted: hasNavigated }}
              variants={{
                enter: ({ dir, mounted }: { dir: number; mounted: boolean }) =>
                  mounted ? { x: dir * 40, opacity: 0 } : { y: 20, opacity: 0 },
                center: {
                  x: 0,
                  y: 0,
                  opacity: 1,
                  transition: mountTransition(2, hasNavigated),
                },
                exit: ({ dir, mounted }: { dir: number; mounted: boolean }) =>
                  mounted
                    ? {
                        x: dir * -40,
                        opacity: 0,
                        transition: {
                          ...mountSpring,
                          opacity: { type: "tween", duration: 0.08 },
                        },
                      }
                    : {
                        scale: 0.8,
                        opacity: 0,
                        transition: { type: "tween", duration: 0.1 },
                      },
              }}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <h2
                className={cn(
                  "font-heading -mb-1 bg-linear-to-tr bg-clip-text text-6xl font-extrabold text-transparent select-none",
                  isOutgoing
                    ? "from-outgoing-dark to-outgoing"
                    : "to-incoming from-incoming-dark",
                )}
              >
                {formatCurrency(selectedDebt.amount, selectedDebt.currency)}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* "to/from" + counterparty */}
        <motion.p
          className="text-primary flex items-center gap-1 text-sm font-medium tracking-wide select-none"
          initial={hasNavigated ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={mountTransition(1, hasNavigated)}
        >
          <motion.span
            layout="position"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="relative z-0"
          >
            {isOutgoing ? "to" : "from"}
          </motion.span>
          <motion.span
            layout="position"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="bg-background relative z-10 inline-flex items-center gap-1.5"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={counterparty}
                initial={hasNavigated ? { scale: 0.85 } : false}
                animate={{
                  scale: 1,
                  transition: mountTransition(1, hasNavigated),
                }}
              >
                {counterparty}
              </motion.span>
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {deadline && (
                <motion.span
                  key={selectedIndex}
                  initial={hasNavigated ? { scale: 0.95 } : false}
                  animate={{
                    scale: 1,
                    transition: mountTransition(1, hasNavigated),
                  }}
                >
                  <span className="text-foreground/30 mr-1.5">|</span>
                  <span
                    className={cn(
                      isPast(deadline) && "text-outgoing font-bold",
                    )}
                  >
                    {isPast(deadline)
                      ? `overdue by ${formatDistanceToNow(deadline)}`
                      : `due in ${formatDistanceToNow(deadline)}`}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>
        </motion.p>
      </div>

      {/* carousel with edge fade */}
      <div
        className="w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 10%, black 40%, black 60%, transparent 90%)",
        }}
        ref={emblaRef}
      >
        <div className="flex touch-pan-y">
          <AnimatePresence>
            {debts.map((debt, index) => (
              <CarouselSlide
                key={debt.id}
                debt={debt}
                index={index}
                isSelected={index === selectedIndex}
                isCreator={currentUser?.id === debt.createdBy}
                isOutgoing={isOutgoing}
                currentUserId={currentUser?.id}
                hasNavigated={hasNavigated}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* nav buttons */}
      <div className="flex items-center justify-center gap-17">
        <motion.button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={selectedIndex === 0}
          aria-label="Previous debt"
          className="text-foreground/60 hover:text-foreground cursor-pointer transition-colors focus:outline-none disabled:pointer-events-none"
          initial={hasNavigated ? false : { x: 5, y: -15, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: selectedIndex === 0 ? 0.25 : 1 }}
          transition={{
            ...mountTransition(1, hasNavigated),
            x: { ...mountSpring, delay: hasNavigated ? 0 : 2 * step },
          }}
        >
          <ChevronLeft className="size-5" />
        </motion.button>
        <Tooltip open={!isCreator ? undefined : false}>
          <TooltipTrigger asChild>
            <span>
              <motion.button
                type="button"
                onClick={() =>
                  updateDebt({
                    id: selectedDebt.id,
                    updates: { status: "paid" },
                  })
                }
                disabled={isMarkingDone || !isCreator}
                className="-m-5 cursor-pointer font-sans text-sm font-medium tracking-wide select-none disabled:pointer-events-none"
                initial={hasNavigated ? false : { y: -15, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: isMarkingDone || !isCreator ? 0.3 : 0.8,
                }}
                whileHover={{
                  opacity: isMarkingDone || !isCreator ? 0.3 : 1,
                  scale: isMarkingDone || !isCreator ? 1 : 0.98,
                }}
                transition={mountTransition(1, hasNavigated)}
              >
                Mark as Done
              </motion.button>
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="tracking-wide"
            sideOffset={4}
          >
            Only the creator can mark this as done
          </TooltipContent>
        </Tooltip>
        <motion.button
          onClick={() => emblaApi?.scrollNext()}
          disabled={selectedIndex === debts.length - 1}
          aria-label="Next debt"
          className="text-foreground/60 hover:text-foreground cursor-pointer transition-colors focus:outline-none disabled:pointer-events-none"
          initial={hasNavigated ? false : { x: -5, y: -15, opacity: 0 }}
          animate={{
            x: 0,
            y: 0,
            opacity: selectedIndex === debts.length - 1 ? 0.25 : 1,
          }}
          transition={{
            ...mountTransition(1, hasNavigated),
            x: { ...mountSpring, delay: hasNavigated ? 0 : 2 * step },
          }}
        >
          <ChevronRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}
