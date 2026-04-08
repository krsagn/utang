import type { Friendship } from "@/entities/friendship";
import { useDeleteFriend } from "../model/useDeleteFriend";

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
      className="group text-outgoing hover:bg-outgoing/10 flex w-fit items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors outline-none"
      onClick={handleRemove}
    >
      <span>Remove Friend</span>
    </button>
  );
}
