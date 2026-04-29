import { format } from "date-fns";
import type { Debt } from "../model/types";

type ReceiptCardProps = Pick<
  Debt,
  | "createdBy"
  | "lenderName"
  | "lendeeName"
  | "currency"
  | "amount"
  | "title"
  | "description"
  | "createdAt"
> & {
  isOutgoing: boolean;
  currentUserId?: string;
};

export function ReceiptCard({
  createdBy,
  lenderName,
  lendeeName,
  currency,
  amount,
  title,
  description,
  createdAt: createdAtStr,
  isOutgoing,
  currentUserId,
}: ReceiptCardProps) {
  const isCreator = createdBy === currentUserId;
  // counterparty = the other person from the current user's perspective
  const counterparty = isOutgoing ? lenderName : lendeeName;
  const createdAt = new Date(createdAtStr);

  return (
    // receipt image is the background; content is absolutely centered over it
    <div className="relative h-101 shrink-0 select-none">
      <img
        src="/empty-receipt-alt2.png"
        alt=""
        aria-hidden
        className="h-full w-auto scale-111 object-fill select-none"
        draggable={false}
      />
      {/* fixed-width column matching the receipt's printable area */}
      <div className="font-receipt absolute top-1/2 left-1/2 flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col text-[17px] leading-3.5 text-neutral-800">
        {/* header: always shows both parties regardless of direction */}
        <div className="mb-5 text-center">
          <p className="uppercase">From {lendeeName}</p>
          <p className="uppercase">To {lenderName}</p>
          <p className="tracking-widest">UTANG.APP</p>
        </div>

        {/* timestamp */}
        <div className="mb-3 flex justify-between">
          <span>{format(createdAt, "MMM dd, yyyy").toUpperCase()}</span>
          <span>{format(createdAt, "hh:mm aa").toUpperCase()}</span>
        </div>

        {/* meta */}
        <div className="mb-1 flex justify-between">
          <span>Created by:</span>
          <span>{isCreator ? "You" : counterparty}</span>
        </div>
        <div className="mb-1 flex justify-between">
          <span>Currency:</span>
          <span>{currency.toUpperCase()}</span>
        </div>
        {/* plain toFixed(2), no symbol — intentional receipt aesthetic */}
        <div className="flex justify-between">
          <span>Total:</span>
          <span>{(parseFloat(amount) || 0).toFixed(2)}</span>
        </div>

        <hr className="my-5 border-t-2 border-dashed border-neutral-500" />

        {/* clamp to keep layout stable regardless of content length */}
        <p className="mb-1 line-clamp-2">{title || "Untitled"}</p>
        <p className="line-clamp-3 opacity-70">
          {description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
