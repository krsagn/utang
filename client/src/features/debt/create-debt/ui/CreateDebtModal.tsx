import {
  Modal,
  Input,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  Calendar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@/shared/ui";
import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarAdd } from "@solar-icons/react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/shared/lib";
import type { NewDebt } from "../model/types";
import { NumericFormat } from "react-number-format";

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDebtModal({ isOpen, onClose }: CreateDebtModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} custom={true}>
      <div className="isolate w-[calc(100vw-2rem)] rounded-4xl bg-white p-6 sm:w-125 sm:p-8">
        <CreateDebtForm onClose={onClose} />
      </div>
    </Modal>
  );
}

function CreateDebtForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"pay" | "receive">("pay");

  const [formData, setFormData] = useState<NewDebt>({
    lenderName: "",
    lendeeName: "",
    currency: "AUD",
    amount: "",
    title: "",
    description: "",
    deadline: "",
  });

  return (
    <form className="flex w-full flex-col items-center justify-center gap-5">
      <TypeToggle type={type} setType={setType} />
      <AmountInput
        value={formData.amount}
        onChange={(val) => setFormData({ ...formData, amount: val })}
        currency={formData.currency}
        onCurrencyChange={(val) => setFormData({ ...formData, currency: val })}
        label={type === "pay" ? "I Owe" : "I Lent"}
      />

      <HorizontalDashedDivider />

      <FriendsCombobox />
      <Input placeholder="Title" className="h-10" />
      <textarea
        placeholder="Description (Optional)"
        className="h-20 w-full min-w-0 resize-none rounded-xl bg-black/5 px-4 py-3 text-base text-black shadow-none transition-all outline-none placeholder:text-black/50 focus-visible:bg-black/10 md:text-sm"
      />
      <DatePicker />

      <HorizontalDashedDivider />

      <div className="flex w-full items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="h-14 flex-1 rounded-2xl bg-black/5 text-sm font-semibold tracking-wide text-black hover:bg-black/10 active:bg-black/15"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-14 flex-1 rounded-2xl text-sm font-semibold tracking-wide"
        >
          Create
        </Button>
      </div>
    </form>
  );
}

function TypeToggle({
  type,
  setType,
}: {
  type: "pay" | "receive";
  setType: (val: "pay" | "receive") => void;
}) {
  return (
    <div className="bg-secondary flex w-fit justify-center gap-2 rounded-3xl p-2 text-sm">
      <button
        type="button"
        onClick={() => setType("pay")}
        className="relative flex w-50 justify-center rounded-2xl py-3"
      >
        {type === "pay" && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-2xl bg-white"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
        <span className="relative z-10 font-medium">To Pay</span>
      </button>

      <button
        type="button"
        onClick={() => setType("receive")}
        className="relative flex w-50 justify-center rounded-2xl py-3"
      >
        {type === "receive" && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-2xl bg-white"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
        <span className="relative z-10 font-medium">To Receive</span>
      </button>
    </div>
  );
}

const CURRENCIES: Record<string, string> = {
  AUD: "$",
  PHP: "₱",
};

function AmountInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  label: string;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative mb-2 flex h-5 w-full items-center justify-center">
        <AnimatePresence initial={false}>
          <motion.label
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            htmlFor="amount"
            className="text-muted-foreground absolute text-sm font-medium"
          >
            {label}
          </motion.label>
        </AnimatePresence>
      </div>
      <motion.div
        layout
        className="relative flex w-full max-w-full items-center justify-center gap-3"
      >
        <Popover>
          <PopoverTrigger asChild>
            <motion.button
              layout
              type="button"
              className="text-foreground/50 flex shrink-0 items-center justify-center gap-1 rounded-2xl py-2 pr-2 pl-3 transition-colors outline-none hover:bg-black/5 active:bg-black/10"
            >
              <div className="relative flex shrink-0 flex-col items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={currency}
                    className="font-heading text-4xl font-extrabold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {CURRENCIES[currency] || "$"}
                  </motion.span>
                </AnimatePresence>
              </div>
              <motion.div layout>
                <ChevronDownIcon className="size-5 opacity-40" />
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
                  <span className="text-muted-foreground w-4 text-center">
                    {symbol}
                  </span>
                  {code}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <motion.div
          layout
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
            placeholder="0.00"
            className="text-foreground placeholder:text-foreground/20 font-heading field-sizing-content max-w-full min-w-0 shrink bg-transparent text-5xl font-extrabold outline-none"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FriendsCombobox() {
  const [inputValue, setInputValue] = useState("");
  const friends: string[] = []; // TODO: Wire up to friends API

  const filtered = friends.filter((f) =>
    f.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const options =
    filtered.length === 0 && inputValue.trim() ? [inputValue.trim()] : filtered;

  return (
    <Combobox>
      <ComboboxInput
        placeholder="With Whom?"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="h-10 md:text-sm"
      />
      <ComboboxContent>
        <ComboboxList>
          {options.map((item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function DatePicker() {
  const [date, setDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full min-w-0 items-center gap-2 rounded-xl bg-black/5 px-4 text-left text-base text-black transition-all outline-none focus-visible:bg-black/10 md:text-sm",
            !date && "text-black/50",
          )}
        >
          <CalendarAdd
            weight="BoldDuotone"
            color="black"
            className="size-5 opacity-50 md:size-4"
          />
          {date ? (
            date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span>Pick a deadline (Optional)</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function HorizontalDashedDivider() {
  const gradientId = useId();

  return (
    <div className="relative -mx-10 flex w-[calc(100%+80px)] shrink-0 items-center justify-center py-2">
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
