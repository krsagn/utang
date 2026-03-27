import {
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  FieldRequiredIndicator,
  DatePicker,
} from "@/shared/ui";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { cn, useUnsavedChanges } from "@/shared/lib";
import type { NewDebt } from "../model/types";
import { AmountInput } from "@/entities/debt";
import type { DebtType } from "@/entities/debt";
import { FriendSelectCombobox } from "@/entities/friendship";
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
                <FriendSelectCombobox
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
