import { useSearchUser, userQueries, type User } from "@/entities/user";
import { cn, useDebounce } from "@/shared/lib";
import { DialogBackdrop } from "@/shared/ui";
import { Check, Plus, Search } from "lucide-react";
import React, { useState } from "react";
import { useAddFriend } from "../model/useAddFriend";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { createPortal } from "react-dom";

const TWEEN_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.25,
};

const ITEM_TRANSITION: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.25,
};

interface AddFriendModalProps {
  onClose: () => void;
}

export function AddFriendModal({ onClose }: AddFriendModalProps) {
  const queryClient = useQueryClient();

  const handleClose = () => {
    queryClient.removeQueries({ queryKey: userQueries.all() });
    onClose();
  };

  return createPortal(
    <>
      <DialogBackdrop onClose={handleClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-friend-title"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: TWEEN_TRANSITION,
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
          transition: {
            type: "tween",
            ease: [0.12, 0, 0.39, 0],
            duration: 0.2,
          },
        }}
        layout="size"
        transition={{ layout: TWEEN_TRANSITION }}
        className="squircle-dialog fixed top-1/2 left-1/2 z-60 w-[calc(100vw-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white px-5 pt-7.5 pb-5 shadow-2xl"
      >
        <motion.div
          layout
          className="flex flex-col items-center px-4 pb-7 text-center"
        >
          <h2
            id="add-friend-title"
            className="font-heading text-2xl font-extrabold tracking-wide"
          >
            Add a friend!
          </h2>
          <p className="text-primary/50 text-xs leading-5 tracking-wide">
            Search users by name or username.
          </p>
        </motion.div>
        <AddFriendCard />
      </motion.div>
    </>,
    document.body,
  );
}

function AddFriendCard() {
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: users } = useSearchUser(debouncedSearch);

  return (
    <motion.div
      layout
      className="flex w-full flex-col items-center justify-center gap-3"
      transition={TWEEN_TRANSITION}
    >
      <motion.div layout="position" className="w-full">
        <div className="squircle relative flex w-full items-center border border-black/8 bg-black/4 px-1 py-1">
          <div className="flex items-center pl-2">
            <Search className="stroke-2.5 text-primary/50 size-3.5" />
          </div>
          <input
            name="search"
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
            placeholder="Search for users..."
            aria-label="Search"
            className="placeholder:text-primary/40 h-9 flex-1 bg-transparent px-3 text-xs tracking-wide outline-none"
          />
        </div>
      </motion.div>
      <motion.ul
        layout
        className="flex w-full flex-col gap-1.5 overflow-clip"
        transition={TWEEN_TRANSITION}
      >
        <AnimatePresence mode="popLayout">
          {users?.map((user, index) => {
            return <AddFriendItem key={user.id} user={user} index={index} />;
          })}
        </AnimatePresence>
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
    <motion.li
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isSuccess ? 0.35 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        ...ITEM_TRANSITION,
        delay: index * 0.05,
      }}
      layout="position"
      className={cn(
        "squircle flex items-center justify-between border border-black/8 bg-black/4 p-3.5 text-xs",
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
              transition={TWEEN_TRANSITION}
            >
              <Check className="size-4 stroke-2" />
            </motion.span>
          ) : (
            <motion.span
              key="plus"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={TWEEN_TRANSITION}
            >
              <Plus className="size-4 stroke-2" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.li>
  );
}
