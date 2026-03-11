import { DebtCarousel } from "@/features/debt/list";

export function Outgoing() {
  return (
    <div className="flex flex-col">
      <DebtCarousel type="pay" />
    </div>
  );
}
