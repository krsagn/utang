import { cn } from "@/shared/lib";
import { motion } from "framer-motion";
import { useControls } from "react-zoom-pan-pinch";

export function BoardHUD({
  debtCount,
  className,
  panning,
  idle,
  onMouseEnter,
  onMouseLeave,
}: {
  debtCount?: number;
  className?: string;
  panning: boolean;
  idle: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { resetTransform } = useControls();

  return (
    <div
      className={cn(
        "squircle text-primary/70 flex gap-2 bg-white/70 px-4 py-3 text-xs tracking-wide text-nowrap shadow-xl backdrop-blur-2xl transition-opacity duration-500 select-none",
        panning ? "cursor-grabbing" : "cursor-default",
        idle ? "opacity-50" : "opacity-100",
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.p layout="position">
        {debtCount ?? "-"} total {debtCount === 1 ? "debt" : "debts"}
      </motion.p>
      <motion.div layout className="flex gap-2">
        <p className="text-primary/30 font-light">|</p>
        <button
          onClick={() => resetTransform(undefined, "easeOutQuad")}
          className={cn(
            "hover:text-primary underline underline-offset-4 transition duration-300 hover:scale-99",
            panning ? "cursor-grabbing" : "cursor-pointer",
          )}
          type="button"
        >
          Re-centre
        </button>
      </motion.div>
    </div>
  );
}
