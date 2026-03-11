import { DebtCarousel } from "@/features/debt/list";

export function Incoming() {
  return (
    <div className="flex flex-col">
      <DebtCarousel type="receive" />
    </div>
  );
}
