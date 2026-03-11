import { Button, Spinner } from "@/shared/ui";
import { X } from "lucide-react";
import { useDeleteFriend } from "../model/useDeleteFriend";
import type { Friendship } from "@/entities/friendship";
import { cn } from "@/shared/lib";

export function RejectFriendButton({
  friendshipId,
}: {
  friendshipId: Friendship["id"];
}) {
  const { mutate: deleteFriend, isPending } = useDeleteFriend("pending");

  const handleDeleteFriend = () => {
    deleteFriend(friendshipId);
  };

  return (
    <Button
      onClick={handleDeleteFriend}
      variant="default"
      disabled={isPending}
      className={cn(
        "w-30 rounded-xl bg-primary/90 p-5 hover:bg-black",
        isPending && "opacity-50",
      )}
    >
      {isPending ? (
        <Spinner className="size-4" />
      ) : (
        <X className="size-4 shrink-0 stroke-[2.5px]" />
      )}
      Reject
    </Button>
  );
}
