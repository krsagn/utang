import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useDeleteFriend } from "../model/useDeleteFriend";
import { UserRoundX, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { DialogBackdrop, DialogPanel } from "@/shared/ui";

interface RemoveFriendDialogProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  friendshipId: string;
  friendName: string;
}

export function RemoveFriendDialog({
  open,
  onCancel,
  onSuccess,
  friendshipId,
  friendName,
}: RemoveFriendDialogProps) {
  const { mutate: removeFriend, isPending: isRemoving } =
    useDeleteFriend("accepted");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const keepItRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
    } else {
      (triggerRef.current as HTMLElement | null)?.focus();
      triggerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => keepItRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRemoving) {
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
  }, [open, isRemoving, onCancel]);

  const handleRemove = () => {
    removeFriend(friendshipId, { onSuccess });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <DialogBackdrop disabled={isRemoving} onClose={onCancel} />
          <DialogPanel
            id="remove-friend-dialog"
            dialogRef={dialogRef}
            cancelRef={keepItRef}
            title="Remove friend?"
            subtitle="They'll be removed from your friends list. A new request would be needed to reconnect."
            actionLabel={`Remove ${friendName}`}
            actionClassName="bg-danger hover:bg-danger-hover focus-visible:ring-danger-hover"
            actionIcon={UserRoundX}
            handleAction={handleRemove}
            cancelLabel="Keep them"
            cancelIcon={X}
            onClose={onCancel}
            disabled={isRemoving}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
