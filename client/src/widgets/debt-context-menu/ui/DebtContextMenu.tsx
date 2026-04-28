import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Pen, Trash } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
} from "@/shared/ui";
import { DeleteDebtDialog } from "@/features/debt/delete-debt";
import { useUpdateDebt } from "@/features/debt/update-debt";
import type { Debt } from "@/entities/debt";

export function DebtContextMenu({
  debt,
  isCreator,
  children,
}: {
  debt: Debt;
  isCreator: boolean;
  children: React.ReactNode;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: updateDebt, isPending } = useUpdateDebt();
  const navigate = useNavigate();

  const handleMarkDone = () => {
    updateDebt({ id: debt.id, updates: { status: "paid" } });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="squircle bg-white/50 backdrop-blur-2xl">
          {isCreator ? (
            <>
              <ContextMenuItem
                onSelect={() => navigate(`/debts/${debt.id}/edit`)}
                className="text-xs tracking-wide"
              >
                <Pen className="mt-px mr-0.5 size-3 stroke-[2.5px]" />
                Edit
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={handleMarkDone}
                disabled={isPending}
                className="text-xs tracking-wide"
              >
                <Check className="mr-0.5 size-3 stroke-[2.5px]" />
                Mark as done
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setTimeout(() => setDeleteOpen(true), 0)}
                className="text-outgoing hover:text-outgoing focus:text-outgoing text-xs tracking-wide"
              >
                <Trash className="mr-0.5 size-3 stroke-[2.5px]" />
                Delete
              </ContextMenuItem>
            </>
          ) : (
            <ContextMenuLabel className="font-normal tracking-wide">
              <span className="font-semibold">
                {debt.createdBy === debt.lenderId
                  ? debt.lenderName
                  : debt.lendeeName}
              </span>{" "}
              created this debt
            </ContextMenuLabel>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <DeleteDebtDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        debtId={debt.id}
      />
    </>
  );
}
