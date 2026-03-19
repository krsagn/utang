import { DebtCarousel } from "@/features/debt/list";

export function Outgoing() {
  return (
    <div className="flex flex-col w-full">
      <DebtCarousel type="pay" />
    </div>
  );
}
