export interface Debt {
  id: string;
  createdBy: string;
  lenderName: string;
  lenderId?: string | null;
  lendeeName: string;
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
