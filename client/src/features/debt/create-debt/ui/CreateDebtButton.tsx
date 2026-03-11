import { Button } from "@/shared/ui";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CreateDebtButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/debts/new")}
      className="flex w-30 items-center gap-3 rounded-xl bg-primary/90 py-5 text-xs font-semibold tracking-wide text-white duration-300 hover:bg-primary/80"
    >
      <Plus className="size-4 shrink-0 stroke-[2.5px]" />
      New Debt
    </Button>
  );
}
