import { formatCompactCurrency } from "@/shared/lib";
import type { DebtType } from "../model/types";
import { ArrowUp, ArrowDown } from "lucide-react";

const VARIATIONS = [
  "/sticky-note.webp",
  "/sticky-note-var1.webp",
  "/sticky-note-var2.webp",
  "/sticky-note-var3.webp",
];

export const VARIATIONS_COUNT = VARIATIONS.length;

export function StickyNote({
  amount,
  currency,
  otherParty,
  type,
  variation,
}: {
  amount: string;
  currency: string;
  otherParty: string;
  type: DebtType;
  variation: number;
}) {
  return (
    <div className="relative size-85 shrink-0 select-none">
      <img
        src={VARIATIONS[variation] ?? VARIATIONS[0]}
        alt=""
        aria-hidden
        className="h-full w-auto object-fill select-none"
        draggable={false}
      />
      <div className="font-playpen absolute top-1/2 left-1/2 flex max-w-60 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 break-all opacity-90">
        <p className="mt-3 line-clamp-1 bg-linear-to-tr from-black to-black/70 bg-clip-text text-4xl font-bold text-transparent">
          {formatCompactCurrency(amount, currency)}
        </p>
        <p className="line-clamp-1 flex items-center gap-1 bg-linear-to-tr from-black/70 to-black bg-clip-text text-transparent">
          <span>
            {type === "pay" ? "to" : "from"} {otherParty}
          </span>
          {type === "pay" ? (
            <ArrowUp className="mt-0.5 size-4 stroke-[2.5px] text-black/80" />
          ) : (
            <ArrowDown className="mt-px size-4 stroke-[2.5px] text-black/80" />
          )}
        </p>
      </div>
    </div>
  );
}
