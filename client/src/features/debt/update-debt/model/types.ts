import type { Debt } from "@/entities/debt";

export type UpdateDebt = Partial<Omit<Debt, "id" | "createdAt">>;
