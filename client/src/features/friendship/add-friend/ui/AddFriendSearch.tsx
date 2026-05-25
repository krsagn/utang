import { DialogBackdrop } from "@/shared/ui";
import { createPortal } from "react-dom";
import { useState } from "react";
import { cn } from "@/shared/lib";
import { useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/entities/user";
import { motion, type Transition } from "framer-motion";
import { AtSign, Plus } from "lucide-react";

const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.3,
};

export function AddFriendSearch({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();
  const handleClose = () => {
    queryClient.removeQueries({ queryKey: userQueries.all() });
    onClose();
  };

  const containerClass =
    "squircle-dialog border border-white/50 bg-linear-to-br from-white/70 to-white/80 backdrop-blur-xs";

  return createPortal(
    <>
      <DialogBackdrop onClose={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={TWEEN_TRANSITION}
        className="fixed top-1/2 left-1/2 z-60 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-xs"
      >
        <div
          className={cn(
            "relative flex justify-between pr-3 pl-10",
            containerClass,
          )}
        >
          <input
            type="text"
            placeholder="Enter a username..."
            value={search}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
            className="placeholder:text-primary/40 text-primary w-md py-3 font-medium tracking-wide transition-colors outline-none placeholder:font-medium"
          />
          <AtSign className="text-primary absolute top-1/2 left-4 size-3.5 -translate-y-1/2 opacity-30" />
          <button
            type="button"
            className={cn(
              "font-medium tracking-wide opacity-30 transition-opacity duration-300",
              search && "opacity-100",
            )}
          >
            <Plus className="text-primary size-3.5" />
          </button>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}
