import { useFriendsSidebar } from "../model/useFriendsSidebar";
import { useFriends, type Friendship } from "@/entities/friendship";
import { X, Check, Plus } from "lucide-react";
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
            ease: [0.22, 1, 0.36, 1],
            duration: 0.7,
          }}
          className="absolute top-0 left-0 z-50 flex h-full w-80 shrink-0 flex-col px-6 py-7 text-[#333]"
        >
          {/* Top Action */}
          <div
            onClick={() => modal.open("add-friend")}
            className="mb-12 flex cursor-pointer items-center gap-3 pl-2 text-xs font-medium tracking-wider text-black opacity-50 transition-opacity hover:opacity-100"
          >
            <Plus className="size-3" />
            <span>Add Friend</span>
          </div>

          <div className="no-scrollbar my-auto flex flex-1 flex-col justify-center gap-10 overflow-y-auto pb-10">
            {/* Friends Section */}
            <div className="flex flex-col gap-5">
              <h3 className="flex items-center gap-2 pl-2 text-xs font-medium tracking-widest text-black opacity-30">
                Friends <span className="text-primary/20">|</span>{" "}
                {acceptedFriends?.length || 0}
              </h3>
              <div className="flex flex-col gap-4">
                {acceptedFriends?.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col justify-center px-2 tracking-wide"
                  >
                    <span className="mb-1 text-xs leading-tight font-semibold text-black">
                      {f.friendFirstName} {f.friendLastName}
                    </span>
                    <span className="text-xs font-medium text-black opacity-50">
                      @{f.friendUsername}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requests Section */}
            {pendingRequests && pendingRequests.length > 0 && (
              <div className="flex flex-col gap-5">
                <h3 className="flex items-center gap-2 pl-2 text-xs font-medium tracking-widest text-black opacity-30">
                  Requests <span className="text-primary/20">|</span>{" "}
                  {pendingRequests.length}
                </h3>
                <div className="flex flex-col gap-4">
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
              className="flex size-8 items-center justify-center rounded-full text-black opacity-30 transition-all outline-none hover:bg-primary/5 hover:opacity-100 active:bg-primary/10"
            >
              <X className="size-5" />
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
        <span className="mb-1 text-xs leading-tight font-bold text-black opacity-50">
          {request.friendFirstName} {request.friendLastName}
        </span>
        <span className="text-xs font-medium text-black opacity-30">
          @{request.friendUsername}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => acceptFriend(request.id)}
          disabled={isPending}
          className="flex size-8 items-center justify-center rounded-full text-black opacity-70 transition-all outline-none hover:bg-primary/5 hover:opacity-100"
        >
          <Check className="size-4 stroke-[2.5px]" />
        </button>
        <button
          onClick={() => rejectFriend(request.id)}
          disabled={isPending}
          className="flex size-8 items-center justify-center rounded-full text-black opacity-70 transition-all outline-none hover:bg-primary/5 hover:opacity-100"
        >
          <X className="size-4 stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
}
