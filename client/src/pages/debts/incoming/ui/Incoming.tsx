import { DebtList } from "@/features/debt/list";

export function Incoming() {
  return (
    <div className="flex flex-col">
      <DebtList type="receive" />
    </div>
  );
}
