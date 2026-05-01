import { useLocation, useNavigate } from "react-router-dom";
import { CreateDebtForm, useCreateDebt } from "@/features/debt/create-debt";
import type { NewDebt } from "@/features/debt/create-debt/model/types";
import type { DebtType } from "@/entities/debt";

export function CreateDebtPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: createDebt, isPending } = useCreateDebt();

  const locationState = location.state as { initialType?: DebtType } | null;
  const initialType: DebtType = locationState?.initialType ?? "pay";

  const handleCancel = () => {
    navigate(initialType === "receive" ? "/debts/incoming" : "/debts/outgoing");
  };

  const handleSubmit = (formData: NewDebt, type: DebtType) => {
    createDebt(
      { ...formData, type },
      {
        onSuccess: () => {
          navigate(type === "pay" ? "/debts/outgoing" : "/debts/incoming");
        },
      },
    );
  };

  return (
    <div className="w-full">
      <CreateDebtForm
        onClose={handleCancel}
        onSubmit={handleSubmit}
        isPending={isPending}
        initialType={initialType}
      />
    </div>
  );
}
