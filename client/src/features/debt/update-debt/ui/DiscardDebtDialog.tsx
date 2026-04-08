import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { Eraser, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { DialogBackdrop, DialogPanel } from "@/shared/ui";

interface DiscardDebtDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscardDebtDialog({
  open,
  onConfirm,
  onCancel,
}: DiscardDebtDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // capture the element that opened the dialog so we can return focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
    } else {
      (triggerRef.current as HTMLElement | null)?.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // auto-focus the safe "Keep editing" button when dialog opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Escape key + focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
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
  }, [open, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <DialogBackdrop onClose={onCancel} />
          <DialogPanel
            id="discard-dialog"
            dialogRef={dialogRef}
            cancelRef={cancelRef}
            title="Discard changes?"
            subtitle="You have unsaved changes. If you leave now, they'll be lost."
            actionLabel="Yes, discard"
            actionClassName="bg-primary/90 hover:bg-primary/95"
            actionIcon={Eraser}
            handleAction={onConfirm}
            cancelLabel="Keep editing"
            cancelIcon={X}
            onClose={onCancel}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
