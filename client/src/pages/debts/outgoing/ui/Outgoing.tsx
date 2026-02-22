import { DebtList } from "@/features/debt/list";

export function Outgoing() {
  return (
    <div className="flex flex-col">
      <DebtList type="pay" />
    </div>
  );
}
