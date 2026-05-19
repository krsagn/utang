import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuShortcut,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutate: updateDebt, isPending } = useUpdateDebt();
  const navigate = useNavigate();

  const handleMarkDone = useCallback(
    () => updateDebt({ id: debt.id, updates: { status: "paid" } }),
    [updateDebt, debt.id],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "e" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/debts/${debt.id}/edit`);
      }
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleMarkDone();
      }
      if (e.key === "Backspace" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setTimeout(() => setDeleteOpen(true), 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, debt.id, handleMarkDone, navigate]);

  return (
    <>
      <ContextMenu onOpenChange={setMenuOpen}>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent
          color="rgba(255,255,255,0.75)"
          className="squircle-dialog"
        >
          {isCreator ? (
            <>
              <ContextMenuItem
                onSelect={() => navigate(`/debts/${debt.id}/edit`)}
                className="gap-8 text-xs tracking-wide"
              >
                Edit
                <ContextMenuShortcut>⌘E</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={handleMarkDone}
                disabled={isPending}
                className="gap-8 text-xs tracking-wide"
              >
                Mark done
                <ContextMenuShortcut>⌘M</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setTimeout(() => setDeleteOpen(true), 0)}
                className="text-danger hover:text-danger focus:text-danger gap-8 text-xs tracking-wide"
              >
                Delete
                <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
              </ContextMenuItem>
            </>
          ) : (
            <ContextMenuLabel className="text-xs font-normal tracking-wide opacity-75">
              <span className="font-medium">
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
