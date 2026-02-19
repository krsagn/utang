// Types
import type { DebtType } from "@/types";

// Feature Components
import DebtCard from "./DebtCard";

// Hooks
import { useDebts } from "@/hooks/useDebts";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function DebtList({ type }: { type: DebtType }) {
  const { data: debts, isLoading, error } = useDebts(type);
  const isOutgoing = type === "pay";

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        Loading debts...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center p-10 text-red-500">
        Error loading debts
      </div>
    );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      {debts?.map((d) => (
        <motion.div variants={item}>
          <DebtCard
            key={d.id}
            owner={isOutgoing ? d.lenderName : d.lendeeName}
            title={d.title}
            amount={d.amount}
            type={type}
            currency={d.currency}
            deadline={d.deadline}
            createdAt={d.createdAt}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
