export interface Debt {
  id: string;
  lenderName: string;
  lendeeName: string;
  currency: string;
  amount: string;
  title: string;
  description?: string;
  deadline?: string;
  status: "PENDING" | "PAID" | "VOID";
  createdAt: string;
}

export type DebtType = "pay" | "receive";
