import { useCreateDebt, useDebts } from "@/hooks/useDebts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { data: debts, isLoading, error } = useDebts();
  const { mutate } = useCreateDebt();

  const { logout: performLogout } = useAuth();

  const handleLogout = () => {
    performLogout();
  };

  const handleCreate = () => {
    mutate({ amount: "100", lender: "Me", lendee: "Romina" });
  };

  if (isLoading)
    return <div className="flex justify-center p-10">Loading debts...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error loading debts</div>;

  return (
    <div className="p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Debts</h1>
        <div className="flex gap-3">
          <Button onClick={handleCreate}>Add Debt</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <div className="grid gap-4">
        {debts?.map((debt) => (
          <div key={debt.id} className="rounded-lg border p-4">
            <div className="flex justify-between font-bold">
              <span>{debt.lender}</span>
              <span>{debt.amount}</span>
            </div>
            <p className="text-sm text-gray-500">
              {debt.description || "No description"}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              {debt.status} • {new Date(debt.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {debts?.length === 0 && <p>No debts found. You are free!</p>}
    </div>
  );
}
