import type { Friendship } from "@/entities/friendship";
import { useDeleteFriend } from "../model/useDeleteFriend";
import { TrashBinTrash } from "@solar-icons/react";

interface RemoveFriendButtonProps {
  friendshipId: Friendship["id"];
  onClose?: () => void;
}

export function RemoveFriendButton({
  friendshipId,
  onClose,
}: RemoveFriendButtonProps) {
  const { mutate: removeFriend } = useDeleteFriend("accepted");

  const handleRemove = () => {
    onClose?.();
    removeFriend(friendshipId);
  };

  return (
    <button
      className="group flex w-fit items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--color-outgoing)] transition-colors outline-none hover:bg-[var(--color-outgoing)]/10"
      onClick={handleRemove}
    >
      <TrashBinTrash
        weight="BoldDuotone"
        className="size-4 opacity-60 transition-opacity group-hover:opacity-100"
      />
      <span>Remove Friend</span>
    </button>
  );
}
