import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useDeleteDebt } from "../model/useDeleteDebt";
import { Trash, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { DialogBackdrop, DialogPanel } from "@/shared/ui";

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
          <DialogBackdrop disabled={isDeleting} onClose={onClose} />
          <DialogPanel
            id="delete-dialog"
            dialogRef={dialogRef}
            cancelRef={keepItRef}
            title="Delete this debt?"
            subtitle="Once deleted, this debt and all its history will be gone for good."
            actionLabel="Yes, delete it"
            actionClassName="bg-outgoing hover:bg-outgoing-hover"
            actionIcon={Trash}
            handleAction={handleDelete}
            cancelLabel="Keep it"
            cancelIcon={X}
            onClose={onClose}
            disabled={isDeleting}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
