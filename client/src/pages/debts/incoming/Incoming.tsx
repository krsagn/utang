import { DebtList } from "@/features/debt";

export default function Incoming() {
  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">To Receive</h1>
      </div>
      <DebtList type="receive" />
    </div>
  );
}
