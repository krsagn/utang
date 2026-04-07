import { motion } from "framer-motion";
import { cn } from "../lib";

function DialogBackdrop({
  disabled = false,
  onClose,
}: {
  disabled?: boolean;
  onClose: () => void;
}) {
  return (
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
      onClick={() => {
        if (!disabled) onClose();
      }}
      className={cn(
        "fixed inset-0 z-60 bg-linear-to-t from-black/80 to-black/40 backdrop-blur-xs duration-200",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    />
  );
}

export { DialogBackdrop };
