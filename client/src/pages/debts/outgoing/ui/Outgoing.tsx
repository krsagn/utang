import { DebtList } from "@/features/debt/list";
import { useModal } from "@/shared/lib";
import { Button, Modal } from "@/shared/ui";

export function Outgoing() {
  const modal = useModal();

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">To Pay</h1>
        <Button variant="secondary" onClick={() => modal.open("create-debt")}>
          Open Modal
        </Button>
      </div>
      <DebtList type="pay" />
      <Modal
        isOpen={modal.isOpen("create-debt")}
        onClose={modal.close}
        custom={false}
      />
    </div>
  );
}
