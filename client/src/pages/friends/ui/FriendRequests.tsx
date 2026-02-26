import { FriendList } from "@/features/friendship/list";

export function FriendRequests() {
  return (
    <div className="flex flex-col">
      <FriendList status="pending" />
    </div>
  );
}
