export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Debt {
  id: string;
  lender: string;
  lendee: string;
  amount: string;
  description?: string;
  deadline?: string;
  status: "PENDING" | "PAID";
  createdAt: string;
}

export type NewDebt = Omit<Debt, "id" | "createdAt" | "status">;

export type UpdateDebt = Partial<Debt>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}
