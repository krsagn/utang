export interface Debt {
  id: string;
  createdBy: string;
  lenderName: string;
  lenderFullName?: string | null;
  lenderId?: string | null;
  lendeeName: string;
  lendeeFullName?: string | null;
  lendeeId?: string | null;
  currency: string;
  amount: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  status: "pending" | "paid" | "void";
  createdAt: string;
  updatedAt?: string | null;
}

export type DebtType = "pay" | "receive";
