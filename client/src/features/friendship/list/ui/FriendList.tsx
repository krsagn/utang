import { FriendCard, useFriends, type Friendship } from "@/entities/friendship";
import { AcceptFriendButton } from "@/features/friendship/accept-friend";
import { AnimatePresence, motion } from "framer-motion";

export function FriendList({ status }: { status: Friendship["status"] }) {
  const { data: friends, isLoading, error } = useFriends(status);

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        Loading friends...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center p-10 text-red-500">
        Error loading friends
      </div>
    );

  if (!friends?.length)
    return (
      <div className="flex items-center justify-center p-10 text-black/40">
        {status === "accepted"
          ? "No friends yet. Add someone to get started!"
          : "No pending requests."}
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {friends?.map((f, i) => {
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  delay: i * 0.05,
                }}
              >
                <FriendCard
                  friendFirstName={f.friendFirstName}
                  friendLastName={f.friendLastName}
                  friendUsername={f.friendUsername}
                  status={f.status}
                  createdAt={f.createdAt}
                  updatedAt={f.updatedAt}
                  action={
                    f.status === "pending" ? (
                      <AcceptFriendButton friendId={f.id} />
                    ) : undefined
                  }
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
