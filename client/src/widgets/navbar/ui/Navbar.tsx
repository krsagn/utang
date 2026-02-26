import { type ReactNode } from "react";
import { CreateDebtButton } from "@/features/debt/create-debt";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/lib";

interface NavbarProps {
  titleKey: string;
  title: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Navbar({ titleKey, title, className, children }: NavbarProps) {
  return (
    <AnimatePresence mode="popLayout">
      <div
        className={cn(
          "flex w-full items-center justify-between px-10 pt-10 pb-5",
          className ?? "",
        )}
      >
        <motion.div
          key={titleKey}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          {typeof title === "string" ? (
            <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
          ) : (
            title
          )}
        </motion.div>
        <div className="flex items-center gap-3 drop-shadow-lg">
          {children}
          <CreateDebtButton />
        </div>
      </div>
    </AnimatePresence>
  );
}
