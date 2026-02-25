import {
  Modal,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui";
import { useId } from "react";
import { CalendarMark, User, Pen, TrashBinTrash } from "@solar-icons/react";
import { X, Check, Info, MoreHorizontal } from "lucide-react";
import { cn, formatCurrency } from "@/shared/lib";
import { useDebt, type Debt, type DebtType } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { useFriends } from "@/entities/friendship";

interface DebtDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
}

export function DebtDetailsModal({
  isOpen = true,
  onClose,
  debtId,
}: DebtDetailsModalProps) {
  const { data: debt } = useDebt(debtId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} custom={true}>
      <div className="isolate flex w-[calc(100vw-2rem)] items-end justify-center gap-10 overflow-clip rounded-4xl sm:w-md">
        {debt && <DebtDetailsCard onClose={onClose} debt={debt} />}
      </div>
    </Modal>
  );
}

function DebtDetailsCard({
  onClose,
  debt,
}: {
  onClose: () => void;
  debt: Debt;
}) {
  const { data: currentUser } = useSession();

  const type: DebtType = currentUser?.id === debt.lendeeId ? "pay" : "receive";

  const { data: friends } = useFriends("accepted");
  const otherPartyName = (() => {
    if (type === "pay") {
      const lender = friends?.find((f) => debt.lenderId === f.friendId);
      if (lender) return `${lender?.friendFirstName} ${lender?.friendLastName}`;
      return debt.lenderName;
    } else {
      const lendee = friends?.find((f) => debt.lendeeId === f.friendId);
      if (lendee) return `${lendee?.friendFirstName} ${lendee?.friendLastName}`;
      return debt.lendeeName;
    }
  })();

  return (
    <div className="flex w-full flex-col">
      {/* Top Ticket Section */}
      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-t-[36px] bg-white p-6 pb-0 sm:p-8 sm:pb-0">
        <Header debt={debt} />
        <AmountDisplay
          amount={debt.amount}
          currency={debt.currency}
          type={type}
        />
      </div>

      {/* Punched Divider */}
      <HorizontalDashedDivider punched />

      {/* Bottom Display Section */}
      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-b-[36px] bg-white p-6 pt-0 sm:p-8 sm:pt-0">
        <div className="mt-0.5 flex h-10 w-full items-center overflow-hidden rounded-xl bg-neutral-100/75">
          <div className="h-full min-w-0 flex-1">
            <FriendDisplay name={otherPartyName} />
          </div>
          <div className="w-px shrink-0 self-stretch bg-black/5" />
          <div className="h-full min-w-0 flex-1">
            <DateDisplay deadline={debt.deadline} />
          </div>
        </div>

        <div className="flex w-full flex-col overflow-hidden rounded-xl bg-neutral-100/75">
          <div
            className={cn(
              "flex h-10 w-full items-center px-4 text-sm font-medium text-black",
              !debt.title && "opacity-25",
            )}
          >
            {debt.title || "Untitled"}
          </div>
          <div className="h-px w-full shrink-0 bg-black/5" />
          <div
            className={cn(
              "flex min-h-20 w-full px-4 py-2.5 text-sm text-black",
              !debt.description && "opacity-25",
            )}
          >
            {debt.description || "No description provided."}
          </div>
        </div>

        <HorizontalDashedDivider />

        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-14 flex-1 gap-1.5 rounded-2xl bg-black/5 text-sm font-semibold tracking-wide text-black hover:bg-black/10 active:bg-black/15"
          >
            <X className="size-4 shrink-0 stroke-[2.5px]" />
            Close
          </Button>
          <Button
            type="button"
            className="h-14 flex-1 gap-1.5 rounded-2xl bg-black/90 text-sm font-semibold tracking-wide hover:bg-black"
          >
            <Check className="size-4 shrink-0 stroke-[2.5px]" />
            Mark Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function Header({ debt }: { debt: Debt }) {
  const { data: currentUser } = useSession();

  const creatorName = (() => {
    if (debt.createdBy === currentUser?.id) {
      return "you";
    } else if (debt.createdBy === debt.lendeeId) {
      return debt.lendeeName;
    } else if (debt.createdBy === debt.lenderId) {
      return debt.lenderName;
    } else {
      return debt.createdBy;
    }
  })();

  const isPaid = debt.status === "paid";
  const statusColor = isPaid
    ? "bg-primary/10 text-primary"
    : "bg-black/5 text-black/50";

  return (
    <div className="flex w-full items-center justify-between">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex size-8 items-center justify-center rounded-full text-black/40 transition-colors outline-none hover:bg-black/5 hover:text-black active:bg-black/10">
            <Info className="size-5" strokeWidth={2.5} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 text-sm" align="start">
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold tracking-wide text-black">
              Created by {creatorName}
            </p>
            <p className="tracking-wide text-black/60">
              {new Date(debt.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <div
        className={cn(
          "rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase",
          statusColor,
        )}
      >
        {debt.status}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex size-8 items-center justify-center rounded-full text-black/40 transition-colors outline-none hover:bg-black/5 hover:text-black active:bg-black/10">
            <MoreHorizontal className="size-5" strokeWidth={2.5} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-36 overflow-hidden rounded-xl p-1"
          align="end"
        >
          <div className="flex flex-col">
            <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-black transition-colors outline-none hover:bg-black/5">
              <Pen weight="BoldDuotone" className="size-4 opacity-50" />
              <span>Edit</span>
            </button>
            <button className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[#AF1D1D] transition-colors outline-none hover:bg-[#AF1D1D]/10">
              <TrashBinTrash
                weight="BoldDuotone"
                className="size-4 opacity-60 transition-opacity group-hover:opacity-100"
              />
              <span>Delete</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AmountDisplay({
  amount,
  currency,
  type,
}: {
  amount: string;
  currency: string;
  type: DebtType;
}) {
  return (
    <div className="relative mt-6 mb-2 flex w-full flex-col items-center justify-center overflow-hidden">
      <p className="mb-2 text-sm font-medium tracking-wide text-black/50">
        {type === "pay" ? "to pay" : "to receive"}
      </p>
      <div className="relative flex max-w-full items-center justify-center gap-3">
        <div
          className={cn(
            "font-heading max-w-full min-w-0 shrink bg-transparent font-extrabold",
            cn(
              "bg-linear-to-tr bg-clip-text text-transparent",
              type === "pay"
                ? "from-[#7D1313] to-[#AF1D1D]"
                : "to-primary from-[#6A7D13]",
            ),
            cn("text-6xl", parseInt(amount) > 99999.99 && "mb-1 text-5xl"),
          )}
        >
          {formatCurrency(amount, currency)}
        </div>
      </div>
    </div>
  );
}

function FriendDisplay({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center gap-2 bg-transparent pl-3 text-black md:text-sm">
      <User
        weight="BoldDuotone"
        color="black"
        className="size-5 shrink-0 md:size-4"
      />
      <span className="truncate">{name || "Unknown"}</span>
    </div>
  );
}

function DateDisplay({ deadline }: { deadline?: string | null }) {
  const value = deadline ? new Date(deadline) : undefined;

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 items-center gap-2 bg-transparent px-3 text-center text-base text-black md:text-sm",
        !value && "text-black/50",
      )}
    >
      <CalendarMark
        weight="BoldDuotone"
        color="black"
        className="size-5 shrink-0 md:size-4"
      />
      <span className="truncate">
        {value
          ? value.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "No Deadline"}
      </span>
    </div>
  );
}

function HorizontalDashedDivider({ punched = false }: { punched?: boolean }) {
  const gradientId = useId();

  if (!punched) {
    return (
      <div className="relative -mx-6 flex w-[calc(100%+48px)] shrink-0 items-center justify-center py-5 sm:-mx-8 sm:w-[calc(100%+64px)]">
        <svg
          className="h-0.5 w-full"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="100"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="black" stopOpacity="0" />
              <stop offset="50%" stopColor="black" stopOpacity="0.15" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="1"
            x2="100"
            y2="1"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            strokeDasharray="4 8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex w-full shrink-0 items-center justify-center py-10">
      <div className="absolute inset-x-0 -inset-y-px bg-white mask-[radial-gradient(circle_16px_at_0%_50%,transparent_16px,black_16.5px),radial-gradient(circle_16px_at_100%_50%,transparent_16px,black_16.5px)] mask-[51%_100%,51%_100%] mask-position-[left,right] mask-no-repeat" />
      <svg
        className="relative z-10 h-0.5 w-[calc(100%-32px)]"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="100"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="50%" stopColor="black" stopOpacity="0.15" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeDasharray="4 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
