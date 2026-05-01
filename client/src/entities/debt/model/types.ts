export interface Debt {
  id: string;
  createdBy: string;
  lenderId: string | null;
  lendeeId: string | null;
  strangerName: string | null;
  lenderFirstName: string | null;
  lenderLastName: string | null;
  lendeeFirstName: string | null;
  lendeeLastName: string | null;
  currency: string;
  amount: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: "pending" | "paid" | "void";
  createdAt: string;
  updatedAt: string | null;
}

export type DebtType = "pay" | "receive";
