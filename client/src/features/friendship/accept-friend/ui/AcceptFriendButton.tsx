import { Button, Spinner } from "@/shared/ui";
import { Check } from "lucide-react";
import { useAcceptFriend } from "../model/useAcceptFriend";
import type { Friendship } from "@/entities/friendship";

export function AcceptFriendButton({
  friendId,
}: {
  friendId: Friendship["id"];
}) {
  const { mutate: acceptFriend, isPending } = useAcceptFriend();

  const handleAcceptFriend = () => {
    acceptFriend(friendId);
  };

  return (
    <Button
      onClick={handleAcceptFriend}
      variant="default"
      disabled={isPending}
      className="rounded-xl p-5"
    >
      {isPending ? (
        <Spinner className="size-4" />
      ) : (
        <Check className="size-4 shrink-0 stroke-[2.5px]" />
      )}
      Accept
    </Button>
  );
}
