import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useLogout } from "../model/useLogout";
import { useEffect, useRef } from "react";
import { DialogBackdrop, DialogPanel } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

function LogOutIcon({ className }: { className?: string }) {
  return <LogOut className={cn(className, "rotate-180")} />;
}

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const { mutate: handleLogout, isPending: isLoggingOut } = useLogout();
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

  // auto-focus the safe "No, I'm staying" button when dialog opens
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
      if (e.key === "Escape" && !isLoggingOut) {
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
  }, [open, isLoggingOut, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <DialogBackdrop disabled={isLoggingOut} onClose={onClose} />
          <DialogPanel
            id="logout-dialog"
            dialogRef={dialogRef}
            cancelRef={cancelRef}
            title="Already leaving?"
            subtitle="Everything's saved and ready for when you come back. You can always log back in anytime!"
            actionLabel="Yes, log out"
            actionClassName="px-28"
            actionIcon={LogOutIcon}
            handleAction={handleLogout}
            cancelLabel="No, I'm staying"
            cancelIcon={X}
            onClose={onClose}
            disabled={isLoggingOut}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
