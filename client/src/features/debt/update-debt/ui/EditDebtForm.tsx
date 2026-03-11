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
import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input as FieldSizingInput } from "react-field-sizing-content";

import { ChevronDownIcon, X, Check, Asterisk } from "lucide-react";
import { cn } from "@/shared/lib";
import type { UpdateDebtForm } from "../model/types";
import type { Debt, DebtType } from "@/entities/debt";
import { NumericFormat } from "react-number-format";
import { useFriends } from "@/entities/friendship";

export function EditDebtForm({
  onClose,
  onSubmit,
  isPending,
  debt,
  type,
}: {
  onClose: () => void;
  onSubmit: (formData: UpdateDebtForm, type: DebtType) => void;
  isPending: boolean;
  debt: Debt;
  type: DebtType;
}) {
  const [formData, setFormData] = useState<UpdateDebtForm>({
    lenderName: debt.lenderName,
    lendeeName: debt.lendeeName,
    lenderId: debt.lenderId,
    lendeeId: debt.lendeeId,
    currency: debt.currency,
    amount: debt.amount,
    title: debt.title,
    description: debt.description ?? undefined,
    deadline: debt.deadline ?? undefined,
  });

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
      {/* type indicator + amount */}
      <div className="flex flex-col items-center justify-center gap-5">
        <TypeDisplay type={type} />
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
            <label className="flex items-center gap-0.5 text-xs font-semibold tracking-wide text-primary/50">
              With Whom?
              <Asterisk className="size-3 stroke-[2.5px] text-primary/30" />
            </label>
            <div className="flex flex-1 items-center overflow-hidden squircle border border-primary/10 bg-transparent transition-colors focus-within:border-primary/20">
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
            <label className="px-0.5 text-xs font-semibold tracking-wide text-primary/50">
              Deadline <span className="text-primary/30">(Optional)</span>
            </label>
            <div className="flex flex-1 items-center overflow-hidden squircle border border-primary/10 bg-transparent transition-colors focus-within:border-primary/30">
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
          <label className="flex items-center gap-0.5 px-0.5 text-xs font-semibold tracking-wide text-primary/50">
            Title
            <Asterisk className="size-3 stroke-[2.5px] text-primary/30" />
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
              "w-full squircle border border-primary/10 bg-transparent p-3 text-xs tracking-wide text-black transition-colors outline-none placeholder:text-black placeholder:opacity-25 focus:border-primary/20",
              formData.title && "font-medium",
            )}
          />
        </div>

        {/* description */}
        <div className="flex flex-col gap-2">
          <label className="px-0.5 text-xs font-semibold tracking-wide text-primary/50">
            Description <span className="text-primary/30">(Optional)</span>
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
              "h-20 w-full resize-none squircle border border-primary/10 bg-transparent p-3 text-xs tracking-wide text-black transition-colors outline-none placeholder:text-black placeholder:opacity-25 focus:border-primary/20",
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
                      className="h-12 w-full gap-2 squircle bg-primary/90 text-xs font-normal tracking-wide hover:scale-99 hover:bg-primary/95 disabled:pointer-events-none disabled:opacity-40"
                      disabled={isPending || !isValid}
                    >
                      <Check className="size-3.5 shrink-0 stroke-[2.5px]" />
                      Save Debt
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
            className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary/40 transition-colors hover:text-primary/50"
          >
            <X className="size-3 stroke-[2.5px]" />
            Discard
          </button>
        </div>
      </div>
    </form>
  );
}

function TypeDisplay({ type }: { type: DebtType }) {
  const isOutgoing = type === "pay";

  return (
    <motion.div className="flex flex-col items-center gap-1 opacity-50 select-none">
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
            isOutgoing ? "text-[var(--color-outgoing)]" : "text-[var(--color-incoming)]",
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
  );
}

const CURRENCIES: Record<string, string> = {
  AUD: "$",
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const SizingInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <FieldSizingInput ref={ref} fieldSizing="content" {...props} />);

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
                "flex shrink-0 items-center justify-center gap-1 rounded-2xl py-2 pr-2 pl-3 transition-colors outline-none hover:bg-primary/5 active:bg-primary/10",
                value
                  ? type === "pay"
                    ? "text-[var(--color-outgoing-dark)]"
                    : "text-[var(--color-incoming-dark)]"
                  : type === "pay"
                    ? "text-[var(--color-outgoing-dark)] opacity-50"
                    : "text-[var(--color-incoming-dark)] opacity-50",
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
          <PopoverContent className="w-fit p-2" align="center" side="bottom">
            <div className="flex flex-col gap-1">
              {Object.entries(CURRENCIES).map(([code, symbol]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onCurrencyChange(code)}
                  className={cn(
                    "squircle flex items-center justify-center gap-3 p-2 text-xs transition duration-150 outline-none hover:opacity-90",
                    currency === code
                      ? "font-medium opacity-100"
                      : "opacity-30",
                  )}
                >
                  <span className="text-center">{symbol}</span>
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
            customInput={SizingInput}
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
              "font-heading max-w-full min-w-[4ch] shrink bg-transparent text-6xl font-extrabold outline-none",
              value
                ? cn(
                    "bg-linear-to-tr bg-clip-text text-transparent transition-colors",
                    type === "pay"
                      ? "from-[var(--color-outgoing-dark)] to-[var(--color-outgoing)] caret-[var(--color-outgoing)]/30"
                      : "to-[var(--color-incoming)] from-[var(--color-incoming-dark)] caret-[var(--color-incoming-dark)]/30",
                  )
                : type === "pay"
                  ? "text-[var(--color-outgoing-dark)]/30 placeholder:text-[var(--color-outgoing-dark)]/30"
                  : "text-[var(--color-incoming-dark)]/30 placeholder:text-[var(--color-incoming-dark)]/30",
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
      value={value.id ?? null}
      onValueChange={(selectedId) => {
        if (!selectedId) return;

        const selectedFriend = safeFriends.find(
          (f) => f.friendId === selectedId,
        );
        if (selectedFriend) {
          const fullName = `${selectedFriend.friendFirstName} ${selectedFriend.friendLastName}`;

          setInputValue(fullName);

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

      {(filteredFriends.length > 0 ||
        (inputValue && inputValue.trim().length > 0)) && (
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList className="overflow-hidden">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <ComboboxItem
                  key={friend.friendId}
                  value={friend.friendId}
                  className="group flex flex-col items-start gap-0 text-xs tracking-wide"
                >
                  <span className="opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                    {friend.friendFirstName} {friend.friendLastName}
                  </span>
                  <span className="text-primary/40 opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                    @{friend.friendUsername}
                  </span>
                </ComboboxItem>
              ))
            ) : (
              <ComboboxItem
                value={inputValue}
                className="group flex flex-col items-start gap-0 text-xs"
              >
                <span className="opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                  {inputValue}
                </span>
                <span className="text-primary/50 opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                  Stranger
                </span>
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
