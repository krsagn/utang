import { useModal } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { Plus } from "lucide-react";
import { CreateDebtModal } from "./CreateDebtModal";
import { useLocation } from "react-router-dom";
import type { DebtType } from "@/entities/debt";

export function CreateDebtButton() {
  const modal = useModal();
  const { pathname } = useLocation();

  const initialType: DebtType =
    pathname === "/debts/incoming" ? "receive" : "pay";

  return (
    <>
      <Button
        onClick={() => modal.open("create-debt")}
        className="flex w-30 items-center gap-3 rounded-xl bg-black/90 py-5 text-xs font-semibold tracking-wide text-white duration-300 hover:scale-98 hover:bg-black/80"
      >
        <Plus className="size-4 shrink-0 stroke-[2.5px]" />
        New Debt
      </Button>
      <CreateDebtModal
        isOpen={modal.isOpen("create-debt")}
        onClose={modal.close}
        initialType={initialType}
      />
    </>
  );
}
