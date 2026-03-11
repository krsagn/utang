import { memo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  type Debt,
  type DebtType,
  useDebts,
  ReceiptCard,
} from "@/entities/debt";
import { useSession } from "@/entities/user";
import { formatCurrency, cn } from "@/shared/lib";

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
receiptImg.src = "/empty-receipt.webp";

// memo'd so only the 2 cards whose isSelected changes re-render on navigation
const CarouselSlide = memo(function CarouselSlide({
  debt,
  index,
  isSelected,
  isOutgoing,
  currentUserId,
  hasNavigated,
}: {
  debt: Debt;
  index: number;
  isSelected: boolean;
  isOutgoing: boolean;
  currentUserId: string | undefined;
  hasNavigated: boolean;
}) {
  return (
    <motion.div
      className="flex-none basis-auto"
      initial={hasNavigated ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...mountSpring, delay: index * 0.1 }}
    >
      <div
        className={cn(
          "transition-[scale,opacity] duration-300 ease-out",
          isSelected ? "scale-100 opacity-100" : "scale-85 opacity-40",
        )}
      >
        <ReceiptCard
          {...debt}
          isOutgoing={isOutgoing}
          currentUserId={currentUserId}
        />
      </div>
    </motion.div>
  );
});

export function DebtCarousel({ type }: { type: DebtType }) {
  const { data: debts, isLoading, error } = useDebts(type, "pending");
  const { data: currentUser } = useSession();
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
  const isInitialSelectRef = useRef(true);
  const selectedIndexRef = useRef(0); // avoids stale closure when computing direction
  const debtsRef = useRef(debts); // always-fresh ref for use inside embla callbacks
  const reInitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    debtsRef.current = debts;
  });

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
      if (debtId) navigate({ search: `?debtId=${debtId}` }, { replace: true });
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

  // reinit Embla after mount stagger settles so slide positions are accurate
  useEffect(() => {
    if (!emblaApi || !debts) return;
    const totalDuration = debts.length * 50 + 400;
    reInitTimerRef.current = setTimeout(() => emblaApi.reInit(), totalDuration);
    return () => {
      if (reInitTimerRef.current) clearTimeout(reInitTimerRef.current);
    };
  }, [emblaApi, debts]);

  if (isLoading || !imageReady)
    return (
      <div className="flex items-center justify-center p-10">
        Loading debts...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center p-10 text-red-500">
        Error loading debts
      </div>
    );
  if (!debts || debts.length === 0)
    return (
      <div className="text-muted-foreground flex items-center justify-center p-10">
        No debts found.
      </div>
    );

  const selectedDebt = debts[selectedIndex] ?? debts[0];
  const counterparty = isOutgoing
    ? selectedDebt.lenderName
    : selectedDebt.lendeeName;
  const deadline = selectedDebt.deadline
    ? new Date(selectedDebt.deadline)
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* hero summary */}
      <div className="flex flex-col items-center gap-1 text-center">
        {/* direction arrow */}
        <motion.img
          src={isOutgoing ? "/outgoing-arrow.svg" : "/incoming-arrow.svg"}
          alt=""
          aria-hidden
          className={cn("h-12", isOutgoing && "-mb-2")}
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
              layout
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
                  "font-heading -mb-1 bg-linear-to-tr bg-clip-text text-6xl font-extrabold text-transparent",
                  isOutgoing
                    ? "from-[#7D1313] to-[#AF1D1D]"
                    : "to-primary from-[#6A7D13]",
                )}
              >
                {formatCurrency(selectedDebt.amount, selectedDebt.currency)}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* "to/from" + counterparty */}
        <motion.p
          className="text-foreground/70 flex items-center gap-1.5 text-sm tracking-wide"
          initial={hasNavigated ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={mountTransition(1, hasNavigated)}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {isOutgoing ? "to" : "from"}
          </motion.span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={selectedIndex}
              initial={hasNavigated ? { scale: 0.95, opacity: 0 } : false}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                transition: mountTransition(1, hasNavigated),
              }}
              style={{ display: "inline-block" }}
            >
              {counterparty}
            </motion.span>
          </AnimatePresence>
          {deadline && (
            <>
              <span className="text-foreground/30">|</span>
              <span>due in {formatDistanceToNow(deadline)}</span>
            </>
          )}
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
          {debts.map((debt, index) => (
            <CarouselSlide
              key={debt.id}
              debt={debt}
              index={index}
              isSelected={index === selectedIndex}
              isOutgoing={isOutgoing}
              currentUserId={currentUser?.id}
              hasNavigated={hasNavigated}
            />
          ))}
        </div>
      </div>

      {/* nav buttons */}
      <div className="flex items-center justify-center gap-10">
        <motion.button
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous debt"
          className={cn(
            "text-foreground/60 hover:text-foreground cursor-pointer transition-colors focus:outline-none",
            selectedIndex === 0 && "opacity-50",
          )}
          initial={hasNavigated ? false : { x: 5, y: -15, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{
            ...mountTransition(1, hasNavigated),
            x: { ...mountSpring, delay: hasNavigated ? 0 : 2 * step },
          }}
        >
          <ChevronLeft className="size-5" />
        </motion.button>
        <motion.span
          className="font-sans text-sm font-medium tracking-wide select-none"
          initial={hasNavigated ? false : { y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={mountTransition(1, hasNavigated)}
        >
          Mark as Done
        </motion.span>
        <motion.button
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next debt"
          className={cn(
            "text-foreground/60 hover:text-foreground cursor-pointer transition-colors focus:outline-none",
            selectedIndex === debts.length - 1 && "opacity-50",
          )}
          initial={hasNavigated ? false : { x: -5, y: -15, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
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
