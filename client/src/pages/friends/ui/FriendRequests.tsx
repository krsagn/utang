import { FriendList } from "@/features/friendship/list";
import { useModal } from "@/shared/lib";
import { ModalBackdrop } from "@/shared/ui";

export function FriendRequests() {
  const modal = useModal();

  return (
    <div className="flex flex-col">
      <FriendList status="pending" />
      <ModalBackdrop isActive={modal.hasActiveModal} onClose={modal.close} />
    </div>
  );
}
