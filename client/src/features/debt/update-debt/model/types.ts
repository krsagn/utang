import type { Debt } from "@/entities/debt";

export type UpdateDebtForm = Omit<
  Debt,
  "id" | "createdAt" | "createdBy" | "status" | "updatedAt"
>;

export type UpdateDebtPayload = Partial<UpdateDebtForm> & {
  status?: "pending" | "paid" | "void";
};
