import { DebtList } from "@/features/debt/list";
import { Navbar } from "@/widgets/navbar";

export function Incoming() {
  return (
    <div className="flex flex-col">
      <Navbar title="To Receive" />
      <DebtList type="receive" />
    </div>
  );
}
