import type React from "react";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  onClose: () => void;
  custom: boolean;
  children?: React.ReactNode;
  "aria-labelledby"?: string;
}

function Modal({
  onClose,
  custom,
  children,
  "aria-labelledby": ariaLabelledBy,
}: ModalProps) {
  return createPortal(
    <motion.dialog
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center"
    >
      <motion.div
        initial={{ y: 5, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{
          y: 5,
          scale: 0.95,
          opacity: 0,
          transition: { type: "tween", duration: 0.1 },
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        onClick={(e) => e.stopPropagation()}
        className="drop-shadow-xl"
      >
        {custom ? (
          children
        ) : (
          <div className="rounded-3xl bg-white p-10">unfinished for now...</div>
        )}
      </motion.div>
    </motion.dialog>,
    document.body,
  );
}

function ModalBackdrop({
  isActive,
  onClose,
}: {
  isActive: boolean;
  onClose: () => void;
}) {
  // disable scrollbar when any modal is active
  useEffect(() => {
    if (isActive) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isActive]);

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="fixed inset-0 z-40 bg-linear-to-t from-black/60 to-black/25 backdrop-blur-xs"
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

export { Modal, ModalBackdrop };
