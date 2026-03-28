import { motion, AnimatePresence } from "framer-motion";
import { Asterisk, Check } from "lucide-react";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  opacity: { type: "tween", duration: 0.08 },
} as const;

export function FieldRequiredIndicator({ filled }: { filled: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {filled ? (
        <motion.span
          key="check"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={SPRING_TRANSITION}
        >
          <Check className="text-primary/40 ml-px size-2.5 stroke-3" />
        </motion.span>
      ) : (
        <motion.span
          key="asterisk"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={SPRING_TRANSITION}
        >
          <Asterisk className="text-primary/30 size-3 stroke-[2.5px]" />
        </motion.span>
      )}
    </AnimatePresence>
  );
}
