import { useLocation, useNavigate } from "react-router-dom";
import { CreateDebtForm, useCreateDebt } from "@/features/debt/create-debt";
import { useSession } from "@/entities/user";
import type { NewDebt } from "@/features/debt/create-debt/model/types";
import type { DebtType } from "@/entities/debt";

export function CreateDebtPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useSession();
  const { mutate: createDebt, isPending } = useCreateDebt();

  const locationState = location.state as { initialType?: DebtType } | null;
  const initialType: DebtType = locationState?.initialType ?? "pay";

  const handleSubmit = (formData: NewDebt, type: DebtType) => {
    if (!user) return;

    const payload = { ...formData };

    if (type === "pay") {
      payload.lendeeId = user.id;
      payload.lendeeName = `${user.firstName} ${user.lastName}`;
    } else {
      payload.lenderId = user.id;
      payload.lenderName = `${user.firstName} ${user.lastName}`;
    }

    createDebt(payload, {
      onSuccess: () => {
        if (type === "pay") {
          navigate("/debts/outgoing");
        } else {
          navigate("/debts/incoming");
        }
      },
    });
  };

  return (
    <div className="w-full">
      <CreateDebtForm
        onClose={() => navigate(-1)}
        onSubmit={handleSubmit}
        isPending={isPending}
        initialType={initialType}
      />
    </div>
  );
}
