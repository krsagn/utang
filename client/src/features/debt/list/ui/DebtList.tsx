import { type DebtType, DebtCard, useDebts } from "@/entities/debt";

import { motion, AnimatePresence } from "framer-motion";

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {debts?.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              delay: i * 0.05, // Index-based stagger!
            }}
          >
            <DebtCard
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
      </AnimatePresence>
    </div>
  );
}
