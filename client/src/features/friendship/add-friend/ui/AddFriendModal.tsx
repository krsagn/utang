import { useSearchUser, userQueries, type User } from "@/entities/user";
import { cn, useDebounce } from "@/shared/lib";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Modal,
} from "@/shared/ui";
import { Check, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useAddFriend } from "../model/useAddFriend";
import { useQueryClient } from "@tanstack/react-query";

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
    <Modal
      onClose={handleClose}
      custom={true}
      aria-labelledby="add-friend-title"
    >
      <div className="isolate flex w-[calc(100vw-2rem)] flex-col overflow-clip rounded-4xl sm:w-md">
        <AddFriendCard onClose={handleClose} />
      </div>
    </Modal>
  );
}

function AddFriendCard({ onClose }: { onClose: () => void }) {
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: users } = useSearchUser(debouncedSearch);

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-[36px] bg-white p-6 sm:p-8">
      <div className="mb-5 flex w-full justify-between">
        <div className="flex flex-col">
          <h2
            id="add-friend-title"
            className="font-heading text-2xl font-extrabold tracking-wide"
          >
            Add friend
          </h2>
          <p className="text-sm leading-5 tracking-wide text-black/50">
            Expand your debt circle!
          </p>
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full text-black/40 transition-colors outline-none hover:bg-black/5 hover:text-black active:bg-black/10"
        >
          <X className="size-5" strokeWidth={2.5} />
        </button>
      </div>
      <InputGroup className="rounded-b-none border-b border-black/10">
        <InputGroupInput
          name="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for users..."
          aria-label="Search"
          className="h-10 px-4"
        />
        <InputGroupAddon>
          <Search className="stroke-2.5 size-3.5 text-black/50" />
        </InputGroupAddon>
      </InputGroup>
      <ul className="flex h-75 w-full flex-col overflow-clip rounded-b-2xl bg-black/5">
        {users?.map((user) => {
          return <AddFriendItem key={user.id} user={user} />;
        })}
      </ul>
    </div>
  );
}

function AddFriendItem({ user }: { user: User }) {
  const { mutate: addFriend, isPending, isSuccess } = useAddFriend();

  const handleAddFriend = () => {
    addFriend(user.id);
  };

  return (
    <li
      className={cn(
        "flex items-center justify-between border-b border-black/10 p-3 text-xs transition duration-300 hover:bg-black/5",
        isSuccess && "opacity-50",
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
          "flex size-6 items-center justify-center rounded-full transition duration-300 hover:scale-95",
          !isSuccess && "hover:bg-black/10",
        )}
        onClick={handleAddFriend}
        disabled={isPending || isSuccess}
      >
        {isSuccess ? (
          <Check className="stroke-2.5 size-4" />
        ) : (
          <Plus className="stroke-2.5 size-4" />
        )}
      </button>
    </li>
  );
}
