import { DebtList } from "@/features/debt/list";
import { Navbar } from "@/widgets/navbar";

export function Outgoing() {
  return (
    <div className="flex flex-col">
      <Navbar title="To Pay" />
      <DebtList type="pay" />
    </div>
  );
}
