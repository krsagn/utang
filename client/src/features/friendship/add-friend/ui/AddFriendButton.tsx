import { useModal } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { Plus } from "lucide-react";
import { AddFriendModal } from "./AddFriendModal";
import { AnimatePresence } from "framer-motion";

export function AddFriendButton() {
  const modal = useModal();

  return (
    <>
      <Button
        onClick={() => modal.open("add-friend")}
        className="flex w-30 items-center gap-3 rounded-xl bg-primary/90 py-5 text-xs font-semibold tracking-wide text-white duration-300 hover:bg-primary/80"
      >
        <Plus className="size-4 shrink-0 stroke-[2.5px]" />
        Add Friend
      </Button>
      <AnimatePresence>
        {modal.isOpen("add-friend") && <AddFriendModal onClose={modal.close} />}
      </AnimatePresence>
    </>
  );
}
