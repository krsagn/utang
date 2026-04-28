import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { hashId, getCardPosition, getCardRotation } from "../lib/board-utils";
import { StickyNote, VARIATIONS_COUNT } from "@/entities/debt";
import { useDebts } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { CANVAS_SIZE } from "../lib/board-utils";
import { useNavigate } from "react-router-dom";
import { DebtContextMenu } from "@/widgets/debt-context-menu";
import { useRef } from "react";
import { motion } from "framer-motion";

export function DebtBoard() {
  const { data: debts } = useDebts(undefined, "pending");
  const { data: currentUser } = useSession();
  const navigate = useNavigate();
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l to-transparent" />
      <TransformWrapper maxScale={2.5} centerOnInit centerZoomedOut>
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
                  whileHover={{ scale: 0.98 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <StickyNote
                    amount={parseInt(debt.amount)}
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
                      className="absolute inset-12"
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
      </TransformWrapper>
    </div>
  );
}
