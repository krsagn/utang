import { formatCompactCurrency } from "@/shared/lib";
import type { DebtType } from "../model/types";

export const VARIATIONS_COUNT = 3;

const VARIATIONS = [
  "/sticky-note.webp",
  "/sticky-note-var1.webp",
  "/sticky-note-var2.webp",
];

export function StickyNote({
  amount,
  currency,
  otherParty,
  type,
  variation,
}: {
  amount: number;
  currency: string;
  otherParty: string;
  type: DebtType;
  variation: number;
}) {
  return (
    <div className="relative size-85 shrink-0 transition duration-300 select-none hover:scale-102">
      <img
        src={VARIATIONS[variation] ?? VARIATIONS[0]}
        alt=""
        aria-hidden
        className="h-full w-auto object-fill select-none"
        draggable={false}
      />
      <div className="font-playpen absolute top-1/2 left-1/2 flex max-w-60 -translate-x-1/2 -translate-y-1/2 flex-col gap-1 break-all opacity-90">
        <span className="mt-3 line-clamp-1 text-4xl font-bold">
          {formatCompactCurrency(amount, currency)}
        </span>
        <span className="ml-3 line-clamp-1">
          {type === "pay" ? "to" : "from"} {otherParty}
        </span>
      </div>
    </div>
  );
}
