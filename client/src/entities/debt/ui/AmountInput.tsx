import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { DebtType } from "../model/types";

const CURRENCIES: Record<string, string> = {
  AUD: "$",
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function AmountInput({
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
