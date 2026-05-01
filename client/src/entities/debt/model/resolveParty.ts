import type { Debt } from "./types";

export function resolveOtherParty(debt: Debt, currentUserId?: string): string {
  const isOutgoing = debt.lendeeId === currentUserId;
  const firstName = isOutgoing ? debt.lenderFirstName : debt.lendeeFirstName;
  const lastName = isOutgoing ? debt.lenderLastName : debt.lendeeLastName;
  return firstName
    ? `${firstName} ${lastName ?? ""}`.trim()
    : (debt.strangerName ?? "");
}

export function resolveOtherPartyFirstName(
  debt: Debt,
  currentUserId?: string,
): string {
  const isOutgoing = debt.lendeeId === currentUserId;
  const firstName = isOutgoing ? debt.lenderFirstName : debt.lendeeFirstName;
  return firstName ?? debt.strangerName ?? "";
}
