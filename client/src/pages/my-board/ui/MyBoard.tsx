import { StickyNote } from "@/entities/debt";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const debts = [
  { id: 1, amount: 50, currency: "AUD", lendeeName: "Jaden" },
  { id: 2, amount: 1200, currency: "AUD", lendeeName: "Sarah" },
  { id: 3, amount: 999999, currency: "USD", lendeeName: "Alex" },
];

export function MyBoard() {
  return (
    <TransformWrapper>
      <TransformComponent wrapperClass="!w-full !h-full">
        <div
          className="relative border border-black"
          style={{
            backgroundImage: `
          linear-gradient(to right, #e5e7eb 1px, transparent 1px),
          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
        `,
            backgroundSize: "60px 60px",
            width: 3000,
            height: 3000,
          }}
        >
          {debts.map((debt, i) => {
            const x = 300;
            const y = 300;

            return (
              <div
                key={debt.id}
                className="absolute"
                style={{ top: i * y, left: i * x }}
              >
                <StickyNote
                  amount={debt.amount}
                  currency={debt.currency}
                  otherParty={debt.lendeeName}
                />
              </div>
            );
          })}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
