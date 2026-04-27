import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { hashId, getCardPosition, getCardRotation } from "../lib/board-utils";
import { StickyNote, VARIATIONS_COUNT } from "@/entities/debt";
import { useDebts } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { CANVAS_SIZE } from "../lib/board-utils";

export function DebtBoard() {
  const { data: debts } = useDebts();
  const { data: currentUser } = useSession();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l to-transparent" />
      <TransformWrapper centerOnInit centerZoomedOut>
        <TransformComponent wrapperClass="!w-full !h-screen">
          <div
            className="relative -m-120 scale-70 border border-black"
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
                <div
                  key={debt.id}
                  className="absolute"
                  style={{
                    left: x - 170,
                    top: y - 170,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <StickyNote
                    amount={parseInt(debt.amount)}
                    currency={debt.currency}
                    otherParty={otherParty}
                    type={type}
                    variation={i % VARIATIONS_COUNT}
                  />
                </div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
