import { useFriendsSidebar } from "../model/useFriendsSidebar";
import { useFriends, type Friendship } from "@/entities/friendship";
import { X, Check, Plus, ChevronLeft } from "lucide-react";
import { useAcceptFriend } from "@/features/friendship/accept-friend/model/useAcceptFriend";
import { useDeleteFriend } from "@/features/friendship/delete-friend/model/useDeleteFriend";
import { useModal } from "@/shared/lib";
import { AddFriendModal } from "@/features/friendship/add-friend";
import { cn } from "@/shared/lib";

import { AnimatePresence, motion } from "framer-motion";

export function FriendsSidebar() {
  const { closeSidebar, isOpen } = useFriendsSidebar();
  const { data: acceptedFriends } = useFriends("accepted");
  const { data: pendingRequests } = useFriends("pending");
  const modal = useModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{
            type: "tween",
            ease: [0.42, 0, 0.58, 1],
            duration: 0.5,
          }}
          className="text-primary absolute top-0 left-0 z-50 flex h-full w-80 shrink-0 flex-col px-6 py-7"
        >
          {/* Top Action */}
          <div
            onClick={() => modal.open("add-friend")}
            className="text-primary/50 hover:text-primary/80 flex w-fit cursor-pointer items-center gap-3 text-xs font-medium tracking-wider transition-colors duration-300"
          >
            <Plus className="size-3 stroke-[2.5px]" />
            <span>Add Friend</span>
          </div>

          <div className="no-scrollbar flex flex-1 flex-col justify-center gap-10 overflow-y-auto pb-10">
            {/* Friends Section */}
            <div className="flex flex-col gap-5">
              <h3 className="text-primary/30 flex items-center gap-2 pl-2 text-xs font-medium tracking-wider">
                Friends <span className="text-primary/20">|</span>{" "}
                {acceptedFriends?.length || 0}
              </h3>
              <div className="flex flex-col gap-6">
                {acceptedFriends?.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col justify-center px-2 tracking-wide"
                  >
                    <span className="text-primary mb-1 text-xs leading-tight font-semibold">
                      {f.friendFirstName} {f.friendLastName}
                    </span>
                    <span className="text-primary/50 text-xs font-medium">
                      @{f.friendUsername}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requests Section */}
            {pendingRequests && pendingRequests.length > 0 && (
              <div className="flex flex-col gap-5">
                <h3 className="text-primary/30 flex items-center gap-2 pl-2 text-xs font-medium tracking-wider">
                  Requests <span className="text-primary/20">|</span>{" "}
                  {pendingRequests.length}
                </h3>
                <div className="flex flex-col gap-6">
                  {pendingRequests.map((f) => (
                    <RequestItem key={f.id} request={f} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="mt-auto pt-6">
            <button
              onClick={closeSidebar}
              className="text-primary/50 hover:text-primary/80 flex w-fit cursor-pointer items-center gap-2.5 text-xs font-medium tracking-wider transition-colors duration-300"
            >
              <ChevronLeft className="size-3 stroke-[2.5px]" />
              <span>Back</span>
            </button>
          </div>

          {/* Add Friend Modal can live here entirely decoupled */}
          {modal.hasActiveModal && <AddFriendModal onClose={modal.close} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RequestItem({ request }: { request: Friendship }) {
  const { mutate: acceptFriend, isPending: isAccepting } = useAcceptFriend();
  const { mutate: rejectFriend, isPending: isRejecting } =
    useDeleteFriend("pending");

  const isPending = isAccepting || isRejecting;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 tracking-wide",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex flex-col justify-center">
        <span className="text-primary/50 mb-1 text-xs leading-tight font-bold">
          {request.friendFirstName} {request.friendLastName}
        </span>
        <span className="text-primary/30 text-xs font-medium">
          @{request.friendUsername}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => acceptFriend(request.id)}
          disabled={isPending}
          className="hover:bg-primary/5 text-primary/70 hover:text-primary flex size-8 items-center justify-center rounded-full transition-all outline-none"
        >
          <Check className="size-4 stroke-[2.5px]" />
        </button>
        <button
          onClick={() => rejectFriend(request.id)}
          disabled={isPending}
          className="hover:bg-primary/5 text-primary/70 hover:text-primary flex size-8 items-center justify-center rounded-full transition-all outline-none"
        >
          <X className="size-4 stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
}
