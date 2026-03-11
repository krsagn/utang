import { useNavigate, useParams } from "react-router-dom";
import { EditDebtForm, useUpdateDebt } from "@/features/debt/update-debt";
import { useSession } from "@/entities/user";
import { useDebt, type DebtType } from "@/entities/debt";
import type { UpdateDebtForm } from "@/features/debt/update-debt";

export function EditDebtPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useSession();
  const { data: debt } = useDebt(id!);
  const { mutate: updateDebt, isPending } = useUpdateDebt();

  const type: DebtType = user?.id === debt?.lendeeId ? "pay" : "receive";

  const handleSubmit = (formData: UpdateDebtForm, debtType: DebtType) => {
    if (!user || !id) return;

    const payload = { ...formData };

    if (debtType === "pay") {
      payload.lendeeId = user.id;
      payload.lendeeName = `${user.firstName} ${user.lastName}`;
    } else {
      payload.lenderId = user.id;
      payload.lenderName = `${user.firstName} ${user.lastName}`;
    }

    updateDebt(
      { id, updates: payload },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  if (!debt || !user) return null;

  return (
    <div className="w-full">
      <EditDebtForm
        onClose={() => navigate(-1)}
        onSubmit={handleSubmit}
        isPending={isPending}
        debt={debt}
        type={type}
      />
    </div>
  );
}
