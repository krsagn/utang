export interface UpdateDebtForm {
  otherPartyId: string | null;
  strangerName: string | null;
  currency: string;
  amount: string;
  title: string;
  description: string | null;
  deadline: string | null;
}

export type UpdateDebtPayload = Partial<UpdateDebtForm> & {
  status?: "pending" | "paid" | "void";
};
