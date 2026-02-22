import { type ReactNode } from "react";
import { CreateDebtButton } from "@/features/debt/create-debt";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/lib";

interface NavbarProps {
  title: string;
  className?: string;
  children?: ReactNode;
}

export function Navbar({ title, className, children }: NavbarProps) {
  return (
    <AnimatePresence>
      <div
        className={cn(
          "flex w-full items-center justify-between px-10 pt-10 pb-5",
          className ?? "",
        )}
      >
        <motion.h1
          key={title}
          initial={{ opacity: 0, scale: 0.85, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="font-heading text-2xl font-extrabold"
        >
          {title}
        </motion.h1>
        <div className="flex items-center gap-3">
          {children}
          <CreateDebtButton />
        </div>
      </div>
    </AnimatePresence>
  );
}
