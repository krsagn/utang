import { type DebtType, type Debt, DebtCard, useDebts } from "@/entities/debt";
import { useSession } from "@/entities/user";
import { useModal } from "@/shared/lib";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/shared/ui";
import { DeleteDebtDialog } from "@/features/debt/delete-debt";
import { Pen, TrashBinTrash } from "@solar-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function DebtList({ type }: { type: DebtType }) {
  const { data: debts, isLoading, error } = useDebts(type, "pending");
  const { data: currentUser } = useSession();
  const isOutgoing = type === "pay";
  const modal = useModal();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        Loading debts...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center p-10 text-red-500">
        Error loading debts
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {debts?.map((d, i) => {
            const isCreator = d.createdBy === currentUser?.id;

            return (
              <ContextMenu key={d.id}>
                <ContextMenuTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      delay: i * 0.05,
                    }}
                    onClick={() => modal.open("detail-debt", d.id)}
                  >
                    <DebtCard
                      owner={isOutgoing ? d.lenderName : d.lendeeName}
                      title={d.title}
                      amount={d.amount}
                      type={type}
                      currency={d.currency}
                      deadline={d.deadline}
                      createdAt={d.createdAt}
                    />
                  </motion.div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {isCreator ? (
                    <CreatorMenu
                      debt={d}
                      onEdit={() => modal.open("edit-debt", d.id)}
                      onDelete={() => setDeleteTarget(d.id)}
                    />
                  ) : (
                    <InfoMenu debt={d} />
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </AnimatePresence>
      </div>

      <DeleteDebtDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        debtId={deleteTarget ?? ""}
        onDeleted={() => modal.close()}
      />
    </>
  );
}

function CreatorMenu({
  debt,
  onEdit,
  onDelete,
}: {
  debt: Debt;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <ContextMenuLabel>{debt.title || "Untitled"}</ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onEdit}>
        <Pen weight="BoldDuotone" className="size-4 opacity-50" />
        <span>Edit</span>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={onDelete}
        className="text-[#AF1D1D] hover:bg-[#AF1D1D]/10 focus:bg-[#AF1D1D]/10"
      >
        <TrashBinTrash weight="BoldDuotone" className="size-4 opacity-60" />
        <span>Delete</span>
      </ContextMenuItem>
    </>
  );
}

function InfoMenu({ debt }: { debt: Debt }) {
  const creatorName =
    debt.createdBy === debt.lenderId ? debt.lenderName : debt.lendeeName;

  return (
    <>
      <ContextMenuLabel>{debt.title || "Untitled"}</ContextMenuLabel>
      <ContextMenuSeparator />
      <div className="flex flex-col gap-0.5 px-2.5 py-2">
        <p className="text-sm font-semibold tracking-wide text-black">
          Created by {creatorName}
        </p>
        <p className="text-xs tracking-wide text-black/60">
          {new Date(debt.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </>
  );
}
