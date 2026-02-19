// Types
import type { Debt, DebtType } from "../model";

// React
import { useId } from "react";

// Utils
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";

type DebtCardProps = Pick<
  Debt,
  "amount" | "currency" | "title" | "deadline" | "createdAt"
> & {
  type: DebtType;
  owner: string;
};

export function DebtCard({
  type,
  owner,
  amount,
  currency,
  title,
  deadline,
  createdAt,
}: DebtCardProps) {
  const isOutgoing = type === "pay";

  return (
    <article
      className={cn(
        "bg-card relative flex h-48 w-full flex-1 justify-between overflow-hidden rounded-3xl tracking-wide transition duration-300 hover:scale-99",
        isOutgoing && "flex-row-reverse",
      )}
    >
      {/* Arrow portion */}
      <img
        aria-hidden
        src={isOutgoing ? "/outgoing.svg" : "/incoming.svg"}
        alt="Incoming Arrow"
        className={cn(
          "h-full min-w-0 shrink select-none",
          isOutgoing ? "object-left" : "object-right",
        )}
      />
      <DashedDivider
        color={isOutgoing ? "#AF1D1D" : "#839B1A"}
        className="px-10"
      />
      {/* Details portion */}
      <div
        className={cn(
          "flex shrink-0 flex-col justify-between py-5",
          isOutgoing ? "pl-7" : "items-end pr-7",
        )}
      >
        <header className={cn("flex flex-col", !isOutgoing && "items-end")}>
          {/* Currency type */}
          <span
            className={cn(
              "text-base tracking-wider",
              isOutgoing ? "text-[#7D1313]/50" : "text-[#6A7D13]/50",
            )}
          >
            {currency.toUpperCase()}
          </span>
          {/* Formatted amount, adapts to any currency symbol */}
          <h3
            className={cn(
              "font-heading bg-linear-to-tr bg-clip-text text-5xl font-extrabold text-transparent",
              isOutgoing
                ? "from-[#7D1313] to-[#AF1D1D]"
                : "to-primary from-[#6A7D13]",
            )}
          >
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency,
              currencyDisplay: "narrowSymbol",
            }).format(parseFloat(amount))}
          </h3>
        </header>
        <div className={cn("flex flex-col", !isOutgoing && "items-end")}>
          {/* Debt title */}
          <p className="line-clamp-1 text-base font-bold">
            {title ? title : "Untitled"}
          </p>
          {/* Lender/lendee, deadline/date created */}
          <footer className="flex gap-1.5 text-xs">
            <p>
              {isOutgoing ? "to" : "from"} {owner}
            </p>
            <p>•</p>
            {deadline ? (
              <time dateTime={deadline}>
                {formatDistanceToNow(new Date(deadline), { addSuffix: true })}
              </time>
            ) : (
              <time dateTime={createdAt}>
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </time>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}

function DashedDivider({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  const gradientId = useId();

  const punchHole = "size-7 shrink-0 rounded-full bg-background";

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex w-px shrink-0 flex-col items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div className={`${punchHole} -translate-y-1/2`} />
      <svg
        className="h-full w-px py-2"
        viewBox="0 0 1 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeDasharray="4 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className={`${punchHole} translate-y-1/2`} />
    </div>
  );
}
