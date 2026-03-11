import {
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib";
import type { NewDebt } from "../model/types";
import type { DebtType } from "@/entities/debt";
import { NumericFormat } from "react-number-format";
import { useFriends } from "@/entities/friendship";

export function CreateDebtForm({
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

  const handleTypeChange = (newType: DebtType) => {
    setType(newType);
    if (newType === "pay") {
      setFormData((prev) => ({
        ...prev,
        lenderName: prev.lendeeName || prev.lenderName,
        lenderId: prev.lendeeId || prev.lenderId,
        lendeeName: "",
        lendeeId: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        lendeeName: prev.lenderName || prev.lendeeName,
        lendeeId: prev.lenderId || prev.lenderId,
        lenderName: "",
        lenderId: null,
      }));
    }
  };

  return (
    <form
      className="flex w-full flex-col items-center justify-center gap-7"
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
      {/* type toggle + amount */}
      <div className="flex flex-col items-center justify-center gap-5">
        <TypeToggle type={type} onChange={handleTypeChange} />
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

      {/* fields */}
      <div className="flex w-xs flex-col gap-5">
        {/* with whom + deadline row */}
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-xs font-semibold tracking-wide text-black/50">
              With Whom?
            </label>
            <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-black/10 bg-transparent transition-colors [corner-shape:squircle] focus-within:border-black/20">
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
                    setFormData({
                      ...formData,
                      lenderName: name,
                      lenderId: id,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      lendeeName: name,
                      lendeeId: id,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="px-0.5 text-xs font-semibold tracking-wide text-black/50">
              Deadline <span className="text-black/30">(Optional)</span>
            </label>
            <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-black/10 bg-transparent transition-colors [corner-shape:squircle] focus-within:border-black/30">
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
        </div>

        {/* title */}
        <div className="flex flex-col gap-2">
          <label className="px-0.5 text-xs font-semibold tracking-wide text-black/50">
            Title
          </label>
          <input
            type="text"
            maxLength={30}
            value={formData.title}
            placeholder="e.g. Dinner last Friday"
            aria-label="Title"
            aria-required="true"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className={cn(
              "w-full rounded-xl border border-black/10 bg-transparent p-3 text-xs tracking-wide text-black transition-colors outline-none [corner-shape:squircle] placeholder:text-black placeholder:opacity-25 focus:border-black/20",
              formData.title && "font-medium",
            )}
          />
        </div>

        {/* description */}
        <div className="flex flex-col gap-2">
          <label className="px-0.5 text-xs font-semibold tracking-wide text-black/50">
            Description <span className="text-black/30">(Optional)</span>
          </label>
          <textarea
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            maxLength={100}
            placeholder="Any extra details..."
            aria-label="Description"
            className={cn(
              "h-20 w-full resize-none rounded-xl border border-black/10 bg-transparent p-3 text-xs tracking-wide text-black transition-colors outline-none [corner-shape:squircle] placeholder:text-black placeholder:opacity-25 focus:border-black/20",
              formData.description && "font-medium",
            )}
          />
        </div>
        {/* actions */}
        <div className="mt-3 flex flex-col items-center gap-5">
          {(() => {
            const withWhom =
              type === "pay" ? formData.lenderName : formData.lendeeName;
            const missing: string[] = [];
            if (!formData.amount || parseFloat(formData.amount) <= 0)
              missing.push("amount");
            if (!withWhom.trim()) missing.push("who it's with");
            if (!formData.title.trim()) missing.push("title");
            const isValid = missing.length === 0;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full">
                    <Button
                      type="submit"
                      className="h-12 w-full gap-2 rounded-xl bg-black/90 text-xs font-normal tracking-wide [corner-shape:squircle] hover:scale-99 hover:bg-black/95 disabled:pointer-events-none disabled:opacity-40"
                      disabled={isPending || !isValid}
                    >
                      <Plus className="size-3.5 shrink-0 stroke-[2.5px]" />
                      Create Debt
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isValid && (
                  <TooltipContent>Missing: {missing.join(", ")}</TooltipContent>
                )}
              </Tooltip>
            );
          })()}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-medium tracking-wide text-black/40 transition-colors hover:text-black/50"
          >
            <X className="size-3 stroke-[2.5px]" />
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function TypeToggle({
  type,
  onChange,
}: {
  type: DebtType;
  onChange: (val: DebtType) => void;
}) {
  const isOutgoing = type === "pay";
  const toggle = () => onChange(isOutgoing ? "receive" : "pay");

  return (
    <div className="group flex items-center gap-10 select-none">
      <motion.button
        layout="position"
        type="button"
        aria-label="Previous type"
        onClick={toggle}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="text-foreground/30 hover:text-foreground/60 cursor-pointer transition-colors"
      >
        <ChevronLeft className="size-4" />
      </motion.button>

      <motion.div className="flex flex-col items-center gap-1 opacity-50 transition-opacity duration-300 group-hover:opacity-80">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={type}
            src={isOutgoing ? "/outgoing-arrow.svg" : "/incoming-arrow.svg"}
            alt=""
            aria-hidden
            className={cn("h-10", isOutgoing && "mt-2 -mb-2")}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              opacity: { type: "tween", duration: 0.08 },
            }}
          />
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={type}
            className={cn(
              "font-heading text-4xl font-extrabold whitespace-nowrap",
              isOutgoing ? "text-[#AF1D1D]" : "text-primary",
            )}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              opacity: { type: "tween", duration: 0.08 },
            }}
          >
            {isOutgoing ? "to pay" : "to receive"}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <motion.button
        layout="position"
        type="button"
        aria-label="Next type"
        onClick={toggle}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="text-foreground/30 hover:text-foreground/60 cursor-pointer transition-colors"
      >
        <ChevronRight className="size-4" />
      </motion.button>
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
    <div className="relative flex w-full flex-col items-center justify-center">
      <div className="relative flex max-w-full items-center justify-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <motion.button
              layout="position"
              type="button"
              aria-label={`Change currency, currently ${currency}`}
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
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors outline-none hover:bg-black/5",
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
            aria-label="Amount"
            aria-required="true"
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

              return floatValue === undefined || floatValue <= 9999999.99;
            }}
            placeholder="0.00"
            className={cn(
              "font-heading field-sizing-content max-w-full min-w-0 shrink bg-transparent text-6xl font-extrabold outline-none",
              value
                ? cn(
                    "bg-linear-to-tr bg-clip-text text-transparent transition-colors",
                    type === "pay"
                      ? "from-[#7D1313] to-[#AF1D1D] caret-[#AF1D1D]/30"
                      : "to-primary from-[#6A7D13] caret-[#6A7D13]/30",
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
          className={cn(
            "h-auto bg-transparent! [&_input]:h-auto [&_input]:py-3 [&_input]:text-xs [&_input]:tracking-wide [&_input]:text-black [&_input]:placeholder:text-black [&_input]:placeholder:opacity-25",
            inputValue && "[&_input]:font-medium",
          )}
        />
      </div>

      {/* 
        Only show the dropdown content if they haven't exactly matched a friend's name,
        and there are actually friends to show.
      */}
      {(filteredFriends.length > 0 ||
        (inputValue && inputValue.trim().length > 0)) && (
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList className="overflow-hidden">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <ComboboxItem
                  key={friend.friendId}
                  value={friend.friendId}
                  className="flex flex-col items-start gap-0 text-xs tracking-wide"
                >
                  {friend.friendFirstName} {friend.friendLastName}
                  <span className="text-black/40">
                    @{friend.friendUsername}
                  </span>
                </ComboboxItem>
              ))
            ) : (
              <ComboboxItem
                value={inputValue}
                className="flex flex-col items-start gap-0 text-xs"
              >
                {inputValue}
                <span className="text-black/50">Stranger</span>
              </ComboboxItem>
            )}
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
            "flex h-full w-full min-w-0 items-center gap-2 bg-transparent p-3 text-xs tracking-wide text-black outline-none",
            value ? "font-medium" : "opacity-25",
          )}
        >
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
      <PopoverContent className="w-auto p-0" align="start" side="bottom">
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
