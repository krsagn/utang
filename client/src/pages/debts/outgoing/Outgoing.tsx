import { DebtList } from "@/features/debt";

export default function Outgoing() {
  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">To Pay</h1>
      </div>
      <DebtList type="pay" />
    </div>
  );
}
