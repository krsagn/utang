import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteDebt } from "../model/useDeleteDebt";

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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-primary/40 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
            }}
            className="fixed top-1/2 left-1/2 z-60 w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-4xl bg-white p-6 shadow-lg sm:w-sm"
          >
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-2xl font-extrabold tracking-wide">
                Delete this debt?
              </h2>
              <p className="text-sm leading-5 tracking-wide text-primary/50">
                This action cannot be undone. This will permanently delete this
                debt record.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={onClose}
                className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-primary/5 text-sm font-semibold tracking-wide text-black transition duration-300 outline-none hover:scale-98 hover:bg-primary/10 active:bg-primary/15"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-outgoing)] text-sm font-semibold tracking-wide text-white transition duration-300 outline-none hover:scale-98 hover:bg-[color-mix(in srgb, var(--color-outgoing) 75%, black)] active:bg-[color-mix(in srgb, var(--color-outgoing) 55%, black)] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
