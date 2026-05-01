import type { DebtType } from "@/entities/debt";
export interface NewDebt {
  otherPartyId: string | null;
  strangerName: string | null;
  type: DebtType;

  currency: string;
  amount: string;
  title: string;
  description: string | null;
  deadline: string | null;
}
