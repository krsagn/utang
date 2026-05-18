import type React from "react";
import { createPortal } from "react-dom";
import { motion, type Transition } from "framer-motion";

interface ModalProps {
  onClose: () => void;
  children?: React.ReactNode;
  "aria-labelledby"?: string;
}

const ANIMATION_DURATION = 0.7;

const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: ANIMATION_DURATION,
};

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
        transition={TWEEN_TRANSITION}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-linear-to-t from-black/80 to-black/40 backdrop-blur-xs"
      />
      {/* Content */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        transition={TWEEN_TRANSITION}
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
