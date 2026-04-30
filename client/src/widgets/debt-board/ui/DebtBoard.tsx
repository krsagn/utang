import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  hashId,
  getCardPosition,
  getCardRotation,
  seededRandom,
} from "../lib/board-utils";
import { StickyNote, VARIATIONS_COUNT } from "@/entities/debt";
import { useDebts } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { CANVAS_SIZE } from "../lib/board-utils";
import { useNavigate, Link } from "react-router-dom";
import { DebtContextMenu } from "@/widgets/debt-context-menu";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { BoardHUD } from "./BoardHUD";

const gridBackground = {
  backgroundImage: `
    radial-gradient(ellipse 55% 45% at center, var(--background) 0%, transparent 100%),
    linear-gradient(to right, #E6E4E3 1px, transparent 1px),
    linear-gradient(to bottom, #E6E4E3 1px, transparent 1px)
  `,
  backgroundSize: "auto, 60px 60px, 60px 60px",
};

const gridFadeEdges = (
  <>
    <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r to-transparent" />
    <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l to-transparent" />
  </>
);

const images = [
  "/sticky-note.webp",
  "/sticky-note-var1.webp",
  "/sticky-note-var2.webp",
  "/sticky-note-var3.webp",
].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

export function DebtBoard() {
  // data
  const { data: debts, isLoading, error } = useDebts(undefined, "pending");
  const { data: currentUser } = useSession();
  const navigate = useNavigate();

  // interaction state
  const [imagesReady, setImagesReady] = useState(() =>
    images.every((img) => img.complete),
  );
  const [panning, setPanning] = useState(false);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // HUD idle timer
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringHUD = useRef(false);

  const stopTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdle(false);
  };
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), 2000);
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => setIdle(true), 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (imagesReady) return;
    let loaded = images.filter((img) => img.complete).length;
    const handlers = images
      .filter((img) => !img.complete)
      .map((img) => {
        const onLoad = () => {
          loaded++;
          if (loaded === images.length) setImagesReady(true);
        };
        img.addEventListener("load", onLoad);
        return { img, onLoad };
      });
    return () =>
      handlers.forEach(({ img, onLoad }) =>
        img.removeEventListener("load", onLoad),
      );
  }, [imagesReady]);

  if (isLoading || !imagesReady) {
    return (
      <div
        className="relative flex h-screen w-full items-center justify-center"
        style={gridBackground}
      >
        {gridFadeEdges}
        <Spinner className="text-primary/50 size-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative flex h-screen w-full flex-col items-center justify-center gap-2 text-center"
        style={gridBackground}
      >
        {gridFadeEdges}
        <p className="font-heading text-4xl font-extrabold tracking-wide">
          Uh oh!
        </p>
        <p className="text-primary/50 max-w-65 text-sm">
          We couldn't load your debts. Try{" "}
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline underline-offset-4"
          >
            refreshing the page
          </button>
          .
        </p>
      </div>
    );
  }

  if (debts?.length === 0) {
    return (
      <div
        className="relative flex h-screen w-full flex-col items-center justify-center gap-2 text-center"
        style={gridBackground}
      >
        {gridFadeEdges}
        <p className="font-heading text-4xl font-extrabold tracking-wide">
          All clear!
        </p>
        <p className="text-primary/50 max-w-65 text-sm">
          No debts to show. Treat yourself, or go ahead and{" "}
          <Link
            to="/debts/new"
            className="text-primary underline underline-offset-4 opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            record one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-screen w-full overflow-hidden",
        panning ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l to-transparent" />
      <TransformWrapper
        maxScale={2.5}
        centerOnInit
        centerZoomedOut
        onPanningStart={() => {
          setPanning(true);
          stopTimer();
        }}
        onPanningStop={() => {
          setPanning(false);
          if (!isHoveringHUD.current) startTimer();
        }}
      >
        <TransformComponent wrapperClass="!w-full !h-screen">
          <div
            className="relative -m-180 scale-70 border border-black"
            style={{
              backgroundImage: `
          linear-gradient(to right, #E6E4E3 1px, transparent 1px),
          linear-gradient(to bottom, #E6E4E3 1px, transparent 1px)
        `,
              backgroundSize: "60px 60px",
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
            }}
          >
            {debts?.map((debt, i) => {
              const seed = hashId(debt.id);
              const { x, y } = getCardPosition(i, debts.length, seed);
              const rotation = getCardRotation(seed);
              const type =
                debt.lendeeId === currentUser?.id ? "pay" : "receive";
              const otherParty =
                type === "pay" ? debt.lenderName : debt.lendeeName;

              return (
                <motion.div
                  key={debt.id}
                  className="absolute"
                  initial={{
                    left: x - 170,
                    top: y - 170,
                    opacity: 0,
                    scale: 0.95,
                    rotate: rotation * 0.9,
                  }}
                  animate={{
                    left: x - 170,
                    top: y - 170,
                    opacity: 1,
                    scale: 1,
                    rotate: rotation,
                  }}
                  whileHover={{
                    scale: 0.98,
                    rotate: rotation * 0.7,
                    transition: { delay: 0, duration: 0.15 },
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: seededRandom(seed + 3) * 0.3,
                    left: { type: "spring", stiffness: 300, damping: 50 },
                    top: { type: "spring", stiffness: 300, damping: 50 },
                  }}
                >
                  <StickyNote
                    amount={debt.amount}
                    currency={debt.currency}
                    otherParty={otherParty}
                    type={type}
                    variation={i % VARIATIONS_COUNT}
                  />
                  <DebtContextMenu
                    debt={debt}
                    isCreator={currentUser?.id === debt.createdBy}
                  >
                    <div
                      className="absolute inset-12 cursor-pointer"
                      onPointerDown={(e) => {
                        pointerDownPos.current = { x: e.clientX, y: e.clientY };
                      }}
                      onClick={(e) => {
                        const down = pointerDownPos.current;
                        if (!down) return;
                        const dx = e.clientX - down.x;
                        const dy = e.clientY - down.y;
                        if (Math.sqrt(dx * dx + dy * dy) > 5) return; // if dragged, ignore onClick behaviour
                        navigate(
                          `/debts/${type === "pay" ? "outgoing" : "incoming"}?debtId=${debt.id}`,
                        );
                      }}
                    />
                  </DebtContextMenu>
                </motion.div>
              );
            })}
          </div>
        </TransformComponent>
        <BoardHUD
          debtCount={debts?.length}
          className="absolute top-6 left-1/2 -translate-x-1/2"
          panning={panning}
          idle={idle}
          onMouseEnter={() => {
            isHoveringHUD.current = true;
            stopTimer();
          }}
          onMouseLeave={() => {
            isHoveringHUD.current = false;
            startTimer();
          }}
        />
      </TransformWrapper>
    </div>
  );
}
