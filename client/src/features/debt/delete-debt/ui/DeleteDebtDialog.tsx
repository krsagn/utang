import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteDebt } from "../model/useDeleteDebt";
import { Trash, X } from "lucide-react";
import { cn } from "@/shared/lib";
import { useEffect, useRef } from "react";

interface DeleteDebtDialogProps {
  open: boolean;
  onClose: () => void;
  debtId: string;
  onDeleted?: () => void;
}

export function DeleteDebtDialog({
  open,
  onClose,
  debtId,
  onDeleted,
}: DeleteDebtDialogProps) {
  const { mutate: deleteDebt, isPending: isDeleting } = useDeleteDebt();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const keepItRef = useRef<HTMLButtonElement>(null);

  // capture the element that opened the dialog so we can return focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
    } else {
      (triggerRef.current as HTMLElement | null)?.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // auto-focus the safe "Keep it" button when dialog opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => keepItRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Escape key + focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, isDeleting, onClose]);

  const handleDelete = () => {
    deleteDebt(debtId, {
      onSuccess: () => {
        onClose();
        if (onDeleted) {
          setTimeout(() => {
            onDeleted();
          }, 200);
        }
      },
    });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                type: "tween",
                ease: [0.22, 1, 0.36, 1],
                duration: 0.25,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                type: "tween",
                ease: [0.12, 0, 0.39, 0],
                duration: 0.2,
              },
            }}
            onClick={isDeleting ? undefined : onClose}
            className={cn(
              "fixed inset-0 z-60 bg-linear-to-t from-black/80 to-black/40 backdrop-blur-xs",
              isDeleting ? "pointer-events-none" : "cursor-pointer",
            )}
          />
          <motion.div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
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
                id="delete-dialog-title"
                className="font-heading text-2xl font-extrabold tracking-wide"
              >
                Delete this debt?
              </h2>
              <p
                id="delete-dialog-description"
                className="text-primary/50 text-xs leading-5 tracking-wide"
              >
                Once deleted, this debt and all its history will be gone for
                good.
              </p>
            </div>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 select-none">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-outgoing hover:bg-outgoing-hover active:bg-outgoing-active squircle inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-21 text-xs font-medium tracking-wide whitespace-nowrap text-white opacity-90 transition duration-300 outline-none hover:scale-99 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-outgoing focus-visible:ring-offset-2"
              >
                <Trash className="size-3 stroke-[2.5px] text-white" />
                Yes, delete it
              </button>
              <button
                ref={keepItRef}
                onClick={onClose}
                disabled={isDeleting}
                className="text-primary squircle inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-21 text-xs font-medium tracking-wide whitespace-nowrap opacity-30 transition-[opacity,scale] duration-300 outline-none hover:scale-98 hover:opacity-50 disabled:pointer-events-none disabled:opacity-10 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <X className="mt-px size-3 stroke-[2.5px]" />
                Keep it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
