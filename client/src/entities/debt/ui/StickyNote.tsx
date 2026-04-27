import { formatCompactCurrency } from "@/shared/lib";

export function StickyNote({
  amount,
  currency,
  otherParty,
}: {
  amount: number;
  currency: string;
  otherParty: string;
}) {
  return (
    <div className="relative size-75 shrink-0 select-none">
      <img
        src="/sticky-note.webp"
        alt=""
        aria-hidden
        className="h-full w-auto object-fill select-none"
        draggable={false}
      />
      <div className="font-playpen absolute top-1/2 left-1/2 flex max-w-50 -translate-x-1/2 -translate-y-1/2 flex-col gap-1 break-all opacity-90">
        <span className="mt-3 line-clamp-1 text-4xl font-bold">
          {formatCompactCurrency(amount, currency)}
        </span>
        <span className="ml-3 line-clamp-1">to {otherParty}</span>
      </div>
    </div>
  );
}
