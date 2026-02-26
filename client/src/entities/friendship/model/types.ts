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
