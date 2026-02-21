import { type ReactNode } from "react";
import { CreateDebtButton } from "@/features/debt/create-debt";

interface NavbarProps {
  title: string;
  children?: ReactNode;
}

export function Navbar({ title, children }: NavbarProps) {
  return (
    <div className="mb-6 flex w-full items-center justify-between">
      <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
        <CreateDebtButton />
      </div>
    </div>
  );
}
