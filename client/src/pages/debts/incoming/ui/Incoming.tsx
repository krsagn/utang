import { DebtCarousel } from "@/features/debt/list";

export function Incoming() {
  return (
    <div className="flex flex-col w-full">
      <DebtCarousel type="receive" />
    </div>
  );
}
