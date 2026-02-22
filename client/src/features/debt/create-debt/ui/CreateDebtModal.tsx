import {
  Modal,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
  Calendar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  InputGroupAddon,
} from "@/shared/ui";
import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarAdd, User } from "@solar-icons/react";
import {
  ChevronDownIcon,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib";
import type { NewDebt } from "../model/types";
import type { DebtType } from "@/entities/debt";
import { NumericFormat } from "react-number-format";
import { useFriends } from "@/entities/friendship";
import { useSession } from "@/entities/user";
import { useCreateDebt } from "../model/useCreateDebt";

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: DebtType;
}

export function CreateDebtModal({
  isOpen,
  onClose,
  initialType = "pay",
}: CreateDebtModalProps) {
  const { data: user } = useSession();
  const { mutate: createDebt, isPending } = useCreateDebt();
  const navigate = useNavigate();

  const handleSubmit = (formData: NewDebt, type: DebtType) => {
    if (!user) return;

    const payload = { ...formData };

    if (type === "pay") {
      payload.lendeeId = user.id;
      payload.lendeeName = `${user.firstName} ${user.lastName}`;
    } else {
      payload.lenderId = user.id;
      payload.lenderName = `${user.firstName} ${user.lastName}`;
    }

    createDebt(payload, {
      onSuccess: () => {
        onClose();
        if (type === "pay") {
          navigate("/debts/outgoing");
        } else {
          navigate("/debts/incoming");
        }
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} custom={true}>
      <div className="isolate flex w-[calc(100vw-2rem)] flex-col overflow-clip rounded-4xl sm:w-md">
        <CreateDebtForm
          onClose={onClose}
          onSubmit={handleSubmit}
          isPending={isPending}
          initialType={initialType}
        />
      </div>
    </Modal>
  );
}

function CreateDebtForm({
  onClose,
  onSubmit,
  isPending,
  initialType = "pay",
}: {
  onClose: () => void;
  onSubmit: (formData: NewDebt, type: DebtType) => void;
  isPending: boolean;
  initialType?: DebtType;
}) {
  const [type, setType] = useState<DebtType>(initialType);

  const [formData, setFormData] = useState<NewDebt>({
    lenderName: "",
    lendeeName: "",
    currency: "AUD",
    amount: "",
    title: "",
    description: undefined,
    deadline: undefined,
  });

  return (
    <form
      className="flex w-full flex-col"
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          (e.target as HTMLElement).tagName.toLowerCase() !== "textarea"
        ) {
          e.preventDefault();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData, type);
      }}
    >
      {/* Top Ticket Section */}
      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-t-[36px] bg-white p-6 pb-0 sm:p-8 sm:pb-0">
        <TypeToggle
          type={type}
          setType={setType}
          onToggle={(newType) => {
            if (newType === "pay") {
              // "To Pay": I owe them. The friend is the LENDER.
              setFormData((prev) => ({
                ...prev,
                lenderName: prev.lendeeName || prev.lenderName,
                lenderId: prev.lendeeId || prev.lenderId,
                lendeeName: "",
                lendeeId: null,
              }));
            } else {
              // "To Receive": They owe me. The friend is the LENDEE.
              setFormData((prev) => ({
                ...prev,
                lendeeName: prev.lenderName || prev.lendeeName,
                lendeeId: prev.lenderId || prev.lenderId,
                lenderName: "",
                lenderId: null,
              }));
            }
          }}
        />
        <AmountInput
          value={formData.amount}
          onChange={(val) => setFormData({ ...formData, amount: val })}
          currency={formData.currency}
          onCurrencyChange={(val) =>
            setFormData({ ...formData, currency: val })
          }
          type={type}
        />
      </div>

      {/* Punched Divider */}
      <HorizontalDashedDivider punched />

      {/* Bottom Form Section */}
      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-b-[36px] bg-white p-6 pt-0 sm:p-8 sm:pt-0">
        <div className="mt-0.5 flex h-10 w-full items-center overflow-hidden rounded-xl bg-black/5 transition-all focus-within:bg-black/10 hover:bg-black/10">
          <div className="h-full min-w-0 flex-1">
            <FriendsCombobox
              value={{
                name:
                  type === "pay" ? formData.lenderName : formData.lendeeName,
                id:
                  (type === "pay" ? formData.lenderId : formData.lendeeId) ??
                  undefined,
              }}
              onChange={({ name, id }) => {
                if (type === "pay") {
                  setFormData({ ...formData, lenderName: name, lenderId: id });
                } else {
                  setFormData({ ...formData, lendeeName: name, lendeeId: id });
                }
              }}
            />
          </div>
          <div className="w-px shrink-0 self-stretch bg-black/10" />
          <div className="h-full min-w-0 flex-1">
            <DatePicker
              value={
                formData.deadline ? new Date(formData.deadline) : undefined
              }
              onChange={(date) =>
                setFormData({
                  ...formData,
                  deadline: date ? date.toISOString() : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="flex w-full flex-col overflow-hidden rounded-xl bg-black/5 transition-all focus-within:bg-black/10">
          <input
            type="text"
            maxLength={30}
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
            }}
            placeholder="Title"
            className="h-10 w-full bg-transparent px-4 text-sm text-black outline-none placeholder:text-black/50"
          />
          <div className="h-px w-full shrink-0 bg-black/10" />
          <textarea
            value={formData.description ?? ""}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
            }}
            maxLength={100}
            placeholder="Description (Optional)"
            className="h-20 w-full resize-none bg-transparent px-4 py-2.5 text-sm text-black outline-none placeholder:text-black/50"
          />
        </div>

        <HorizontalDashedDivider />

        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-14 flex-1 gap-1.5 rounded-2xl bg-black/5 text-sm font-semibold tracking-wide text-black hover:bg-black/10 active:bg-black/15"
          >
            <X className="size-4 shrink-0" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-14 flex-1 gap-1.5 rounded-2xl text-sm font-semibold tracking-wide"
            disabled={isPending}
          >
            <Plus className="size-4 shrink-0" />
            Create
          </Button>
        </div>
      </div>
    </form>
  );
}

function TypeToggle({
  type,
  setType,
  onToggle,
}: {
  type: DebtType;
  setType: (val: DebtType) => void;
  onToggle: (type: DebtType) => void;
}) {
  return (
    <div className="flex w-fit justify-center gap-2 rounded-3xl bg-black/5 p-2 text-sm">
      <button
        type="button"
        onClick={() => {
          setType("pay");
          onToggle("pay");
        }}
        className={cn(
          "relative flex w-44 items-center justify-center gap-1.5 rounded-2xl py-3 font-semibold transition-colors outline-none",
          type === "pay" ? "text-[#AF1D1D]" : "text-foreground",
        )}
      >
        <ArrowUpRight className="relative z-10 size-4 shrink-0" />
        <span className="relative z-10">To Pay</span>
        {type === "pay" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-2xl bg-white"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setType("receive");
          onToggle("receive");
        }}
        className={cn(
          "relative flex w-44 items-center justify-center gap-1.5 rounded-2xl py-3 font-semibold transition-colors outline-none",
          type === "receive" ? "text-primary" : "text-foreground",
        )}
      >
        <ArrowDownLeft className="relative z-10 size-4 shrink-0" />
        <span className="relative z-10">To Receive</span>
        {type === "receive" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-2xl bg-white"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
}

const CURRENCIES: Record<string, string> = {
  AUD: "$",
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function AmountInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  type,
}: {
  value: string;
  onChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  type: DebtType;
}) {
  return (
    <div className="mt-5 flex w-full flex-col items-center justify-center">
      <div className="relative flex w-full max-w-full items-center justify-center gap-3 mask-[linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
        <Popover>
          <PopoverTrigger asChild>
            <motion.button
              layout="position"
              type="button"
              className={cn(
                "flex shrink-0 items-center justify-center gap-1 rounded-2xl py-2 pr-2 pl-3 transition-colors outline-none hover:bg-black/5 active:bg-black/10",
                value
                  ? type === "pay"
                    ? "text-[#7D1313]"
                    : "text-[#6A7D13]"
                  : type === "pay"
                    ? "text-[#7D1313] opacity-50"
                    : "text-[#6A7D13] opacity-50",
              )}
            >
              <div className="relative flex shrink-0 flex-col items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={currency}
                    className="font-heading text-5xl font-extrabold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {CURRENCIES[currency] || "$"}
                  </motion.span>
                </AnimatePresence>
              </div>
              <motion.div layout="position">
                <ChevronDownIcon className="size-5 opacity-75" />
              </motion.div>
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1" align="center" side="bottom">
            <div className="flex flex-col gap-1">
              {Object.entries(CURRENCIES).map(([code, symbol]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onCurrencyChange(code)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none hover:bg-black/5",
                    currency === code ? "bg-black/5" : "bg-transparent",
                  )}
                >
                  <span className="w-4 text-center">{symbol}</span>
                  {code}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <motion.div
          layout="position"
          className="flex max-w-full min-w-0 shrink items-center"
        >
          <NumericFormat
            id="amount"
            value={value}
            onValueChange={(val) => onChange(val.value)}
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            allowLeadingZeros={false}
            isAllowed={(values) => {
              const { floatValue, value } = values;

              if (/^00/.test(value)) return false;

              const [integerPart] = value.split(".");
              if (integerPart !== undefined && integerPart.length > 8)
                return false;

              return floatValue === undefined || floatValue <= 99999999.99;
            }}
            placeholder="0.00"
            className={cn(
              "font-heading field-sizing-content max-w-full min-w-0 shrink bg-transparent text-6xl font-extrabold outline-none",
              value
                ? cn(
                    "bg-linear-to-tr bg-clip-text text-transparent transition-colors",
                    type === "pay"
                      ? "from-[#7D1313] to-[#AF1D1D]"
                      : "to-primary from-[#6A7D13]",
                  )
                : type === "pay"
                  ? "text-[#7D1313]/30 placeholder:text-[#7D1313]/30"
                  : "text-[#6A7D13]/30 placeholder:text-[#6A7D13]/30",
            )}
          />
        </motion.div>
      </div>
    </div>
  );
}

function FriendsCombobox({
  value,
  onChange,
}: {
  value: { name: string; id?: string };
  onChange: (val: { name: string; id?: string }) => void;
}) {
  const { data: friends, isLoading } = useFriends("accepted");
  const anchorRef = useComboboxAnchor();

  // Keep a local state just for what the user is currently typing
  const [inputValue, setInputValue] = useState(value.name);

  const safeFriends = friends ?? [];
  const filteredFriends = safeFriends.filter((friend) => {
    const friendFullName =
      `${friend.friendFirstName} ${friend.friendLastName}`.toLowerCase();

    const processedValue = value.name.toLowerCase();

    return friendFullName.includes(processedValue) ? friend : null;
  });

  return (
    <Combobox
      // the value is the ID of the friend if they picked one from the list
      // If it's a custom name, `value` is null/undefined in the Combobox's eyes.
      value={value.id ?? null}
      // When a user specifically CLICKS a friend from the dropdown list
      onValueChange={(selectedId) => {
        if (!selectedId) return;

        // Find the full friend object using the ID
        const selectedFriend = safeFriends.find(
          (f) => f.friendId === selectedId,
        );
        if (selectedFriend) {
          const fullName = `${selectedFriend.friendFirstName} ${selectedFriend.friendLastName}`;

          // Update the input box text visually
          setInputValue(fullName);

          // Bubble up both the Full Name AND the ID to our overall Form State
          onChange({
            name: fullName,
            id: selectedId,
          });
        }
      }}
    >
      <div ref={anchorRef} className="h-full w-full">
        <ComboboxInput
          placeholder={isLoading ? "Loading Friends..." : "With Whom?"}
          value={inputValue}
          onChange={(e) => {
            const newName = e.target.value;
            setInputValue(newName);

            // If they are explicitly typing, we assume it's a completely new, unregistered person
            // So we wipe out the ID, and just pass the name up to the Form State
            onChange({
              name: newName,
              id: undefined,
            });
          }}
          className="h-full rounded-r-none bg-transparent! text-black md:text-sm"
        >
          <InputGroupAddon align="inline-start">
            <User
              weight="BoldDuotone"
              color="black"
              className="size-5 opacity-50 md:size-4"
            />
          </InputGroupAddon>
        </ComboboxInput>
      </div>

      {/* 
        Only show the dropdown content if they haven't exactly matched a friend's name,
        and there are actually friends to show.
      */}
      {(filteredFriends.length > 0 ||
        (inputValue && inputValue.trim().length > 0)) && (
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList className="overflow-hidden">
            <AnimatePresence initial={false}>
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <motion.div
                    key={friend.friendId}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <ComboboxItem
                      value={friend.friendId}
                      className="flex flex-col items-start gap-0 text-xs tracking-wide"
                    >
                      {friend.friendFirstName} {friend.friendLastName}
                      <span className="text-black/40">
                        @{friend.friendUsername}
                      </span>
                    </ComboboxItem>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="stranger-fallback"
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <ComboboxItem
                    value={inputValue}
                    className="flex flex-col items-start gap-0 text-xs"
                  >
                    {inputValue}
                    <span className="text-black/50">Stranger</span>
                  </ComboboxItem>
                </motion.div>
              )}
            </AnimatePresence>
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  );
}

function DatePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-full w-full min-w-0 items-center gap-2 bg-transparent px-3 text-center text-base text-black transition-all outline-none md:text-sm",
            !value && "text-black/50",
          )}
        >
          <CalendarAdd
            weight="BoldDuotone"
            color="black"
            className="size-5 opacity-50 md:size-4"
          />
          {value ? (
            value.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span>Deadline (Optional)</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          autoFocus
        />
      </PopoverContent>
    </Popover>
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
