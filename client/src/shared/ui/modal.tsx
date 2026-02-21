import type React from "react";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  custom: boolean;
  children?: React.ReactNode;
}

function Modal({ isOpen, onClose, custom, children }: ModalProps) {
  // disable scrollbar every time modal opens to avoid background scrolling
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // force modal to render on top of everything
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-linear-to-t from-black/60 to-black/25 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="drop-shadow-xl"
          >
            {custom ? (
              children
            ) : (
              <div className="rounded-3xl bg-white p-10">
                unfinished for now...
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export { Modal };
