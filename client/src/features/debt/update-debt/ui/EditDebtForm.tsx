import {
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  FieldRequiredIndicator,
  DatePicker,
} from "@/shared/ui";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { X, Pen } from "lucide-react";
import { cn, useUnsavedChanges } from "@/shared/lib";
import type { UpdateDebtForm } from "../model/types";
import { AmountInput } from "@/entities/debt";
import type { Debt, DebtType } from "@/entities/debt";
import { FriendSelectCombobox } from "@/entities/friendship";
import { DiscardDebtDialog } from "./DiscardDebtDialog";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  opacity: { type: "tween", duration: 0.08 },
} as const;

function normaliseAmount(value: string): string {
  if (!value) return "";
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric.toString();
}

function normaliseDeadline(value?: string | null): string | undefined {
  if (!value) return undefined;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? value : new Date(timestamp).toISOString();
}

function getComparableFormData(formData: UpdateDebtForm) {
  return {
    lenderName: formData.lenderName,
    lendeeName: formData.lendeeName,
    lenderId: formData.lenderId ?? undefined,
    lendeeId: formData.lendeeId ?? undefined,
    currency: formData.currency,
    amount: normaliseAmount(formData.amount),
    title: formData.title,
    description: formData.description || undefined,
    deadline: normaliseDeadline(formData.deadline),
  };
}

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
  const initialValues = {
    lenderName: debt.lenderName,
    lendeeName: debt.lendeeName,
    lenderId: debt.lenderId,
    lendeeId: debt.lendeeId,
    currency: debt.currency,
    amount: debt.amount,
    title: debt.title,
    description: debt.description ?? undefined,
    deadline: debt.deadline ?? undefined,
  };

  const [formData, setFormData] = useState<UpdateDebtForm>(initialValues);
  const withWhom = type === "pay" ? formData.lenderName : formData.lendeeName;
  const isDirty =
    JSON.stringify(getComparableFormData(formData)) !==
    JSON.stringify(getComparableFormData(initialValues));

  const { showDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges({
    enabled: !isPending,
    isDirty,
  });

  const updateFormData = (updates: Partial<UpdateDebtForm>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const missing: string[] = [];
  if (!formData.amount || parseFloat(formData.amount) <= 0)
    missing.push("amount");
  if (!withWhom.trim()) missing.push("who it's with");
  if (!formData.title.trim()) missing.push("title");
  const isValid = missing.length === 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isValid && isDirty && !isPending) onSubmit(formData, type);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isValid, isDirty, isPending, formData, type, onSubmit]);

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
        {/* type indicator + amount */}
        <div className="flex flex-col items-center justify-center gap-5">
          <TypeDisplay type={type} />
          <AmountInput
            value={formData.amount}
            onChange={(val) => updateFormData({ amount: val })}
            currency={formData.currency}
            onCurrencyChange={(val) => updateFormData({ currency: val })}
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
                <FieldRequiredIndicator filled={Boolean(withWhom.trim())} />
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
                      updateFormData({
                        lenderName: name,
                        lenderId: id ?? null,
                      });
                    } else {
                      updateFormData({
                        lendeeName: name,
                        lendeeId: id ?? null,
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
                  updateFormData({
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
              <FieldRequiredIndicator filled={Boolean(formData.title.trim())} />
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
              onChange={(e) => updateFormData({ title: e.target.value })}
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
              onChange={(e) => updateFormData({ description: e.target.value })}
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
                      "squircle bg-primary/90 hover:bg-primary/95 h-12 w-full gap-2.5 text-xs font-normal tracking-wide hover:scale-99 disabled:pointer-events-none disabled:opacity-40",
                      isPending ? "disabled:cursor-progress" : "cursor-pointer",
                    )}
                    disabled={isPending || !isValid || !isDirty}
                  >
                    <Pen className="size-3 shrink-0 stroke-[2.5px]" />
                    Save Changes
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
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
        open={showDialog}
      />
    </>
  );
}

function TypeDisplay({ type }: { type: DebtType }) {
  const isOutgoing = type === "pay";

  return (
    <div className="flex flex-col items-center gap-1 opacity-50 select-none">
      <img
        src={isOutgoing ? "/outgoing-arrow.svg" : "/incoming-arrow.svg"}
        alt=""
        aria-hidden
        className={cn("h-10", isOutgoing && "mt-2 -mb-2")}
      />
      <span
        className={cn(
          "font-heading text-4xl font-extrabold whitespace-nowrap",
          isOutgoing ? "text-outgoing" : "text-incoming",
        )}
      >
        {isOutgoing ? "to pay" : "to receive"}
      </span>
    </div>
  );
}
