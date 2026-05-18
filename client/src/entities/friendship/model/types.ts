export interface Friendship {
  id: string;
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
  friendId: string;
  friendFirstName: string;
  friendLastName: string;
  friendUsername: string;
}

export interface FriendStats {
  netBalance: number;
  settledDebtCount: number;
  longestOwed: {
    id: string;
    amount: number;
    currency: string;
    since: string;
    direction: "incoming" | "outgoing";
  } | null;
}
