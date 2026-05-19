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
        <ContextMenuContent className="squircle-dialog bg-white/80 backdrop-blur-xs">
          {isCreator ? (
            <>
              <ContextMenuItem
                onSelect={() => navigate(`/debts/${debt.id}/edit`)}
                className="pb-1.5 text-xs tracking-wide"
              >
                <Pen className="mt-px mr-0.5 size-3 stroke-[2.5px]" />
                Edit
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={handleMarkDone}
                disabled={isPending}
                className="py-1.5 text-xs tracking-wide"
              >
                <Check className="mr-0.5 size-3 stroke-[2.5px]" />
                Mark as done
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setTimeout(() => setDeleteOpen(true), 0)}
                className="text-outgoing hover:text-outgoing focus:text-outgoing pt-1.5 text-xs tracking-wide"
              >
                <Trash className="mr-0.5 size-3 stroke-[2.5px]" />
                Delete
              </ContextMenuItem>
            </>
          ) : (
            <ContextMenuLabel className="font-normal tracking-wide">
              <span className="font-semibold">
                {debt.createdBy === debt.lenderId
                  ? `${debt.lenderFirstName ?? ""} ${debt.lenderLastName ?? ""}`.trim()
                  : `${debt.lendeeFirstName ?? ""} ${debt.lendeeLastName ?? ""}`.trim()}
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
