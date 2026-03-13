import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, X } from "lucide-react";

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
            onClick={onCancel}
            className="fixed inset-0 z-60 bg-linear-to-t from-black/80 to-black/40 backdrop-blur-xs"
          />
          <motion.div
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
              <h2 className="font-heading text-2xl font-extrabold tracking-wide">
                Discard changes?
              </h2>
              <p className="text-primary/50 text-xs leading-5 tracking-wide">
                You have unsaved changes. If you leave now, they'll be lost.
              </p>
            </div>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 select-none">
              <button
                onClick={onConfirm}
                className="bg-primary squircle inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-21 text-xs font-medium tracking-wide whitespace-nowrap text-white opacity-80 transition duration-300 outline-none hover:scale-99 hover:opacity-85 active:opacity-85 disabled:opacity-50"
              >
                <Eraser className="size-3 stroke-[2.5px] text-white" />
                Yes, discard
              </button>
              <button
                onClick={onCancel}
                className="text-primary squircle inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-21 text-xs font-medium tracking-wide whitespace-nowrap opacity-30 transition-[opacity,scale] duration-300 outline-none hover:scale-98 hover:opacity-50"
              >
                <X className="mt-px size-3 stroke-[2.5px]" />
                Keep editing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
