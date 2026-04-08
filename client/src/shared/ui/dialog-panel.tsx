import { motion } from "framer-motion";
import React from "react";
import { cn } from "../lib";

interface DialogPanelProps {
  // identity
  id: string;
  // refs
  dialogRef: React.RefObject<HTMLDivElement | null>;
  cancelRef: React.RefObject<HTMLButtonElement | null>;
  // content
  title: string;
  subtitle: string;
  // action button
  actionLabel: string;
  actionIcon: React.ComponentType<{ className?: string }>;
  actionClassName?: string;
  handleAction: () => void;
  // cancel button
  cancelLabel: string;
  cancelIcon: React.ComponentType<{ className?: string }>;
  onClose: () => void;
  // state
  disabled?: boolean;
}

function DialogPanel({
  id,
  dialogRef,
  cancelRef,
  title,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon,
  actionClassName,
  handleAction,
  cancelLabel,
  cancelIcon: CancelIcon,
  onClose,
  disabled = false,
}: DialogPanelProps) {
  return (
    <motion.div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          type: "tween",
          ease: [0.22, 1, 0.36, 1],
          duration: 0.25,
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: {
          type: "tween",
          ease: [0.12, 0, 0.39, 0],
          duration: 0.2,
        },
      }}
      className="squircle-dialog fixed top-1/2 left-1/2 z-60 w-min max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 bg-white px-5 pt-7.5 pb-4 shadow-2xl"
    >
      <div className="flex flex-col items-center gap-1 px-4 text-center">
        <h2
          id={`${id}-title`}
          className="font-heading text-2xl font-extrabold tracking-wide"
        >
          {title}
        </h2>
        <p
          id={`${id}-description`}
          className="text-primary/50 text-xs leading-5 tracking-wide"
        >
          {subtitle}
        </p>
      </div>
      <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 select-none">
        <button
          onClick={handleAction}
          disabled={disabled}
          className={cn(
            "bg-primary/97 hover:bg-primary squircle focus-visible:ring-primary inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-21 text-xs font-medium tracking-wide whitespace-nowrap text-white opacity-90 transition duration-300 outline-none hover:scale-99 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            actionClassName,
          )}
        >
          <ActionIcon className="size-3 stroke-[2.5px] text-white" />
          {actionLabel}
        </button>
        <button
          ref={cancelRef}
          onClick={onClose}
          disabled={disabled}
          className="text-primary squircle focus-visible:ring-primary inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-21 text-xs font-medium tracking-wide whitespace-nowrap opacity-30 transition-[opacity,scale] duration-300 outline-none hover:scale-98 hover:opacity-50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-10"
        >
          <CancelIcon className="mt-px size-3 stroke-[2.5px]" />
          {cancelLabel}
        </button>
      </div>
    </motion.div>
  );
}

export { DialogPanel };
