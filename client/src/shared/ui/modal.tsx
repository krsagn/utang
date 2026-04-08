import type React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface ModalProps {
  onClose: () => void;
  children?: React.ReactNode;
  "aria-labelledby"?: string;
}

// AnimatePresence must live at the call site wrapping the conditional render of
// this component — otherwise exit animations never fire because the whole tree
// is removed before they can run.
function Modal({
  onClose,
  children,
  "aria-labelledby": ariaLabelledBy,
}: ModalProps) {
  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-linear-to-t from-black/80 to-black/40 backdrop-blur-xs"
      />
      {/* Content */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 5,
          transition: { type: "tween", duration: 0.1 },
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 z-50 m-auto h-fit w-fit drop-shadow-xl"
      >
        {children}
      </motion.div>
    </>,
    document.body,
  );
}

export { Modal };
