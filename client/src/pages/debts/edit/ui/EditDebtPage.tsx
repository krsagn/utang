import { useNavigate, useParams } from "react-router-dom";
import { EditDebtForm, useUpdateDebt } from "@/features/debt/update-debt";
import { useSession } from "@/entities/user";
import { useDebt, type DebtType } from "@/entities/debt";
import type { UpdateDebtForm } from "@/features/debt/update-debt";

export function EditDebtPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useSession();
  const {
    data: debt,
    isLoading: isDebtLoading,
    isError: isDebtError,
  } = useDebt(id ?? "");
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

  if (!id) {
    return (
      <div className="text-primary/60 flex w-full items-center justify-center py-10 text-xs tracking-wide">
        Invalid debt link.
      </div>
    );
  }

  if (isUserLoading || isDebtLoading) {
    return (
      <div className="text-primary/60 flex w-full items-center justify-center py-10 text-xs tracking-wide">
        Loading debt...
      </div>
    );
  }

  if (isUserError || isDebtError) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 py-10">
        <p className="text-primary/60 text-xs tracking-wide">
          Failed to load debt details.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary/60 hover:text-primary text-xs tracking-wide transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!debt || !user) {
    return (
      <div className="text-primary/60 flex w-full items-center justify-center py-10 text-xs tracking-wide">
        Debt not found.
      </div>
    );
  }

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
