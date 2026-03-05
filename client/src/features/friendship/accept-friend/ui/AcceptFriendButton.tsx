import { Button, Spinner } from "@/shared/ui";
import { Check } from "lucide-react";
import { useAcceptFriend } from "../model/useAcceptFriend";
import type { Friendship } from "@/entities/friendship";
import { cn } from "@/shared/lib";

export function AcceptFriendButton({
  friendshipId,
}: {
  friendshipId: Friendship["id"];
}) {
  const { mutate: acceptFriend, isPending } = useAcceptFriend();

  const handleAcceptFriend = () => {
    acceptFriend(friendshipId);
  };

  return (
    <Button
      onClick={handleAcceptFriend}
      variant="default"
      disabled={isPending}
      className={cn("w-30 rounded-xl p-5", isPending && "opacity-50")}
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
