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
  FieldRequiredIndicator,
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
import { cn, useUnsavedChanges } from "@/shared/lib";
import type { NewDebt } from "../model/types";
import type { DebtType } from "@/entities/debt";
import { NumericFormat } from "react-number-format";
import { useFriends } from "@/entities/friendship";
import { DiscardDebtDialog } from "../../update-debt/ui/DiscardDebtDialog";

const INITIAL_FORM_DATA: NewDebt = {
  lenderName: "",
  lendeeName: "",
  lenderId: null,
  lendeeId: null,
  currency: "AUD",
  amount: "",
  title: "",
  description: undefined,
  deadline: undefined,
};

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  opacity: { type: "tween", duration: 0.08 },
} as const;

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

  // stable initial snapshot - includes type so toggling pay/receive marks the form dirty
  const initialSnapshot = { type: initialType, ...INITIAL_FORM_DATA };

  const [formData, setFormData] = useState<NewDebt>(INITIAL_FORM_DATA);
  const withWhom = type === "pay" ? formData.lenderName : formData.lendeeName;

  const isDirty =
    JSON.stringify({ type, ...formData }) !== JSON.stringify(initialSnapshot);

  const { showDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges({
    enabled: !isPending,
    isDirty,
  });

  const handleTypeChange = (newType: DebtType) => {
    setType(newType);
    if (newType === "pay") {
      setFormData((prev) => ({
        ...prev,
        lenderName: prev.lendeeName,
        lenderId: prev.lendeeId,
        lendeeName: "",
        lendeeId: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        lendeeName: prev.lenderName,
        lendeeId: prev.lenderId,
        lenderName: "",
        lenderId: null,
      }));
    }
  };

  const missing: string[] = [];
  if (!formData.amount || parseFloat(formData.amount) <= 0)
    missing.push("amount");
  if (!withWhom.trim()) missing.push("who it's with");
  if (!formData.title.trim()) missing.push("title");
  const isValid = missing.length === 0;

  return (
    <>
      <form
        className="flex w-full flex-col items-center justify-center gap-7"
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          if (
            e.key === "Enter" &&
            target.tagName.toLowerCase() !== "textarea" &&
            target.tagName.toLowerCase() !== "button"
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
              <label className="text-primary/50 flex items-center gap-0.5 text-xs font-semibold tracking-wide">
                With Whom?
                <FieldRequiredIndicator
                  filled={withWhom.trim() ? true : false}
                />
              </label>
              <div className="squircle border-primary/10 focus-within:border-primary/20 flex flex-1 items-center overflow-hidden border bg-transparent transition-colors">
                <FriendsCombobox
                  value={{
                    name:
                      type === "pay"
                        ? formData.lenderName
                        : formData.lendeeName,
                    id:
                      (type === "pay"
                        ? formData.lenderId
                        : formData.lendeeId) ?? undefined,
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
              <label className="text-primary/50 px-0.5 text-xs font-semibold tracking-wide">
                Deadline <span className="text-primary/30">(Optional)</span>
              </label>
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

          {/* title */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="debt-title"
              className="text-primary/50 flex items-center gap-0.5 px-0.5 text-xs font-semibold tracking-wide"
            >
              Title
              <FieldRequiredIndicator
                filled={formData.title.trim() ? true : false}
              />
            </label>
            <input
              id="debt-title"
              type="text"
              maxLength={30}
              value={formData.title}
              placeholder="e.g. Dinner last Friday"
              aria-label="Title"
              aria-required="true"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              data-gramm="false"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={cn(
                "squircle border-primary/10 focus:border-primary/20 placeholder:text-primary/25 text-primary w-full border bg-transparent p-3 text-xs tracking-wide transition-colors outline-none",
                formData.title && "font-medium",
              )}
            />
          </div>

          {/* description */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="debt-description"
              className="text-primary/50 px-0.5 text-xs font-semibold tracking-wide"
            >
              Description <span className="text-primary/30">(Optional)</span>
            </label>
            <textarea
              id="debt-description"
              value={formData.description ?? ""}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              data-gramm="false"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={100}
              placeholder="Any extra details..."
              aria-label="Description"
              className={cn(
                "squircle border-primary/10 focus:border-primary/20 placeholder:text-primary/25 text-primary h-20 w-full resize-none border bg-transparent p-3 text-xs tracking-wide transition-colors outline-none",
                formData.description && "font-medium",
              )}
            />
          </div>
          {/* actions */}
          <div className="mt-3 flex flex-col items-center gap-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button
                    type="submit"
                    className={cn(
                      "squircle bg-primary/90 hover:bg-primary/95 h-12 w-full gap-2 text-xs font-normal tracking-wide hover:scale-99 disabled:pointer-events-none disabled:opacity-40",
                      isPending ? "disabled:cursor-progress" : "cursor-pointer",
                    )}
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
            <motion.button
              type="button"
              onClick={onClose}
              className="text-primary/40 hover:text-primary/50 flex cursor-pointer items-center gap-2 text-xs font-medium tracking-wide transition-colors"
            >
              <motion.span layout transition={SPRING_TRANSITION}>
                <X className="mt-px size-3 stroke-[2.5px]" />
              </motion.span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  layout
                  key={isDirty ? "discard" : "cancel"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={SPRING_TRANSITION}
                >
                  {isDirty ? "Discard" : "Cancel"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </form>
      <DiscardDebtDialog
        open={showDialog}
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
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
    <div className="group flex w-75 items-center justify-between select-none">
      <button
        type="button"
        aria-label="Previous type"
        onClick={toggle}
        className="text-foreground/30 hover:text-foreground/60 cursor-pointer transition-colors"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex flex-col items-center gap-1 opacity-50 transition-opacity duration-300 group-hover:opacity-90">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={type}
            src={isOutgoing ? "/outgoing-arrow.svg" : "/incoming-arrow.svg"}
            alt=""
            aria-hidden
            className={cn("h-10", isOutgoing && "mt-2 -mb-2")}
            initial={{ scale: 0.98, y: isOutgoing ? 6 : -6 }}
            animate={{ scale: 1, y: 0 }}
            transition={SPRING_TRANSITION}
          />
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={type}
            className={cn(
              "font-heading text-4xl font-extrabold whitespace-nowrap",
              isOutgoing ? "text-outgoing" : "text-incoming",
            )}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={SPRING_TRANSITION}
          >
            {isOutgoing ? "to pay" : "to receive"}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label="Next type"
        onClick={toggle}
        className="text-foreground/30 hover:text-foreground/60 cursor-pointer transition-colors"
      >
        <ChevronRight className="size-4" />
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
  const minChars = 4;
  const effectiveValue = value && value.length > 0 ? value : "0.00";
  const widthCh = Math.max(effectiveValue.length, minChars);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      <div className="relative flex max-w-full items-center justify-center gap-1">
        <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
          <PopoverTrigger asChild>
            <motion.button
              layout="position"
              type="button"
              aria-label={`Change currency, currently ${currency}`}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1 rounded-2xl py-2 pr-2 pl-3 opacity-85 transition-[color,opacity] duration-300 outline-none hover:opacity-100",
                value
                  ? type === "pay"
                    ? "text-outgoing-dark"
                    : "text-incoming-dark"
                  : type === "pay"
                    ? "text-outgoing-dark opacity-50"
                    : "text-incoming-dark opacity-50",
                currencyOpen && "opacity-100",
              )}
            >
              <div className="relative flex w-10 shrink-0 flex-col items-center justify-center">
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
              <div>
                <ChevronDownIcon
                  className={cn(
                    "size-5 opacity-75 transition-transform duration-300",
                    currencyOpen && "rotate-180",
                  )}
                />
              </div>
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
            id="amount"
            aria-label="Amount"
            aria-required="true"
            style={{ width: `${widthCh}ch`, maxWidth: "100%" }}
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
              "font-heading max-w-full shrink bg-transparent text-center text-6xl font-extrabold transition-colors duration-300 outline-none placeholder:transition-colors placeholder:duration-300",
              value
                ? cn(
                    "bg-linear-to-tr bg-clip-text text-transparent",
                    type === "pay"
                      ? "from-outgoing-dark to-outgoing caret-outgoing/30"
                      : "to-incoming from-incoming-dark caret-incoming-dark/30",
                  )
                : type === "pay"
                  ? "text-outgoing-dark/30 placeholder:text-outgoing-dark/30"
                  : "text-incoming-dark/30 placeholder:text-incoming-dark/30",
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
  const [prevName, setPrevName] = useState(value.name);
  if (value.name !== prevName) {
    setPrevName(value.name);
    setInputValue(value.name);
  }

  const safeFriends = friends ?? [];
  const filteredFriends = safeFriends.filter((friend) => {
    const friendFullName =
      `${friend.friendFirstName} ${friend.friendLastName}`.toLowerCase();

    const processedValue = value.name.toLowerCase();

    return friendFullName.includes(processedValue);
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
            "[&_input]:placeholder:text-primary/25 [&_input]:text-primary h-auto bg-transparent! [&_input]:h-auto [&_input]:py-3 [&_input]:text-xs [&_input]:tracking-wide",
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
          <ComboboxList className="no-scrollbar overflow-y-auto mask-[linear-gradient(to_bottom,transparent,black_10px,black_calc(100%-15px),transparent)]">
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
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "squircle border-primary/10 flex flex-1 items-center overflow-hidden border bg-transparent transition-colors",
        open && "border-primary/20",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-primary flex h-full w-full min-w-0 items-center gap-2 bg-transparent p-3 text-xs tracking-wide outline-none",
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
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

