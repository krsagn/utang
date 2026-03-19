import { useSearchUser, userQueries, type User } from "@/entities/user";
import { cn, useDebounce } from "@/shared/lib";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Modal,
} from "@/shared/ui";
import { Check, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useAddFriend } from "../model/useAddFriend";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface AddFriendModalProps {
  onClose: () => void;
}

export function AddFriendModal({ onClose }: AddFriendModalProps) {
  const queryClient = useQueryClient();

  const handleClose = () => {
    queryClient.removeQueries({ queryKey: userQueries.all() });
    onClose();
  };

  return (
    <Modal onClose={handleClose} aria-labelledby="add-friend-title">
      <div className="isolate flex w-[calc(100vw-2rem)] flex-col p-0! sm:w-md">
        <AddFriendCard />
      </div>
    </Modal>
  );
}

function AddFriendCard() {
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: users } = useSearchUser(debouncedSearch);

  return (
    <motion.div
      layout="position"
      className="flex w-full flex-col items-center justify-center gap-5"
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
    >
      <motion.div layout="position" className="w-full">
        <InputGroup className="bg-background/70! rounded-full px-1 py-5 backdrop-blur-xs">
          <InputGroupInput
            name="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for users..."
            aria-label="Search"
            className="h-10 px-4"
          />
          <InputGroupAddon>
            <Search className="stroke-2.5 text-primary/50 size-3.5" />
          </InputGroupAddon>
        </InputGroup>
      </motion.div>
      <motion.ul
        className="flex w-full flex-col gap-3 overflow-clip"
        transition={{ type: "spring", stiffness: 450, damping: 35 }}
      >
        {users?.map((user, index) => {
          return <AddFriendItem key={user.id} user={user} index={index} />;
        })}
      </motion.ul>
    </motion.div>
  );
}

function AddFriendItem({ user, index }: { user: User; index: number }) {
  const { mutate: addFriend, isPending, isSuccess } = useAddFriend();

  const handleAddFriend = () => {
    addFriend(user.id);
  };

  return (
    <AnimatePresence>
      <motion.li
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isSuccess ? 0.35 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          delay: index * 0.05,
          ease: [0.22, 1, 0.36, 1],
          type: "tween",
          duration: 0.2,
        }}
        layout="position"
        className={cn(
          "bg-background/70 squircle-dialog flex items-center justify-between border-b border-white/20 p-4 text-xs backdrop-blur-xs transition duration-300",
        )}
      >
        <div className="flex flex-col justify-center">
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="opacity-50">@{user.username}</p>
        </div>
        <button
          aria-label={
            isSuccess
              ? `Friend request sent to ${user.firstName} ${user.lastName}`
              : `Send friend request to ${user.firstName} ${user.lastName}`
          }
          className={cn(
            "text-primary flex size-6 items-center justify-center rounded-full opacity-50 transition duration-300",
            !isSuccess && "hover:scale-105 hover:opacity-100",
          )}
          onClick={handleAddFriend}
          disabled={isPending || isSuccess}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isSuccess ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  opacity: { type: "tween", duration: 0.08 },
                }}
              >
                <Check className="size-4 stroke-2" />
              </motion.span>
            ) : (
              <motion.span
                key="plus"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  opacity: { type: "tween", duration: 0.08 },
                }}
              >
                <Plus className="size-4 stroke-2" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.li>
    </AnimatePresence>
  );
}
