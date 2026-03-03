import { FriendList } from "@/features/friendship/list";
import { useModal } from "@/shared/lib";
import { ModalBackdrop } from "@/shared/ui";

export function Friends() {
  const modal = useModal();

  return (
    <div className="flex flex-col">
      <FriendList status="accepted" />
      <ModalBackdrop isActive={modal.hasActiveModal} onClose={modal.close} />
    </div>
  );
}
