import { DebtList } from "@/features/debt/list";
import { DebtDetailsModal } from "@/widgets/debt";
import { EditDebtModal } from "@/features/debt/update-debt";
import { useModal } from "@/shared/lib";
import { ModalBackdrop } from "@/shared/ui";
import { AnimatePresence } from "framer-motion";

export function Incoming() {
  const modal = useModal();

  return (
    <div className="flex flex-col">
      <DebtList type="receive" />
      <ModalBackdrop isActive={modal.hasActiveModal} onClose={modal.close} />
      <AnimatePresence mode="wait">
        {modal.isOpen("detail-debt") && (
          <DebtDetailsModal
            key="detail-debt"
            onClose={modal.close}
            debtId={modal.idParam ?? ""}
          />
        )}
        {modal.isOpen("edit-debt") && (
          <EditDebtModal
            key="edit-debt"
            onClose={modal.close}
            debtId={modal.idParam ?? ""}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
