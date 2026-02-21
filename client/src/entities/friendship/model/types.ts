export interface Friendship {
  id: string;
  status: "pending" | "accepted";
  createdAt: string;
  friendId: string;
  friendFirstName: string;
  friendLastName: string;
  friendUsername: string;
}
