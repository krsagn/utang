import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useLogout } from "../model/useLogout";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const { mutate: performLogout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    performLogout();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
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
            onClick={onClose}
            className="fixed inset-0 z-60 bg-linear-to-t from-black/80 to-black/40 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: "tween",
                ease: [0.22, 1, 0.36, 1],
                duration: 0.25,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: {
                type: "tween",
                ease: [0.12, 0, 0.39, 0],
                duration: 0.2,
              },
            }}
            className="squircle-dialog fixed top-1/2 left-1/2 z-60 w-min max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 bg-white px-5 pt-7.5 pb-4 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-1 px-4 text-center">
              <h2 className="font-heading text-2xl font-extrabold tracking-wide">
                Already leaving?
              </h2>
              <p className="text-primary/50 text-xs leading-5 tracking-wide">
                Everything's saved and ready for when you come back. You can
                always log back in anytime!
              </p>
            </div>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 select-none">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-primary squircle inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-26 text-xs font-medium tracking-wide whitespace-nowrap text-white opacity-90 transition duration-300 outline-none hover:scale-99 hover:opacity-95 active:opacity-95 disabled:opacity-50"
              >
                <LogOut className="size-3 rotate-180 stroke-[2.5px] text-white" />
                Yes, log out
              </button>
              <button
                onClick={onClose}
                className="text-primary squircle inline-flex h-10 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-26 text-xs font-medium tracking-wide whitespace-nowrap opacity-30 transition-[opacity,scale] duration-300 outline-none hover:scale-98 hover:opacity-50"
              >
                <X className="mt-px size-3 stroke-[2.5px]" />
                No, I'm staying
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
