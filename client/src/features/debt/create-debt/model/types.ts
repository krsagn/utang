import type { Debt } from "@/entities/debt";

export type NewDebt = Omit<
  Debt,
  "id" | "createdAt" | "updatedAt" | "status" | "createdBy"
>;
