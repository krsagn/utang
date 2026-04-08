import { useFriendsSidebar } from "../model/useFriendsSidebar";
import { useFriends, type Friendship } from "@/entities/friendship";
import { X, Check, Plus, ChevronLeft } from "lucide-react";
import { useAcceptFriend } from "@/features/friendship/accept-friend/model/useAcceptFriend";
import { useDeleteFriend } from "@/features/friendship/delete-friend/model/useDeleteFriend";
import { useModal } from "@/shared/lib";
import { AddFriendModal } from "@/features/friendship/add-friend";
import { cn } from "@/shared/lib";
import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

export function FriendsSidebar() {
  const { closeSidebar, isOpen } = useFriendsSidebar();

  const { data: acceptedFriends } = useFriends("accepted");
  const { data: pendingRequests } = useFriends("pending");
  const modal = useModal();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    const updateGradientVisibility = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const hasOverflow = scrollHeight - clientHeight > 1;

      if (!hasOverflow) {
        setShowTopGradient(false);
        setShowBottomGradient(false);
        return;
      }

      const epsilon = 1;
      setShowTopGradient(scrollTop > epsilon);
      setShowBottomGradient(scrollTop + clientHeight < scrollHeight - epsilon);
    };

    updateGradientVisibility();
    el.addEventListener("scroll", updateGradientVisibility, { passive: true });
    window.addEventListener("resize", updateGradientVisibility);

    return () => {
      el.removeEventListener("scroll", updateGradientVisibility);
      window.removeEventListener("resize", updateGradientVisibility);
    };
  }, [isOpen, acceptedFriends?.length, pendingRequests?.length]);

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
          className="text-primary absolute top-0 left-0 z-50 flex h-full w-80 shrink-0 flex-col justify-between gap-15 p-7"
        >
          {/* Top Action */}
          <div
            onClick={() => modal.open("add-friend")}
            className="text-primary/50 hover:text-primary/80 flex w-fit cursor-pointer items-center gap-3 text-xs font-medium tracking-wider transition-colors duration-300"
          >
            <Plus className="size-3 stroke-[2.5px]" />
            <span>Add Friend</span>
          </div>

          <div className="relative min-h-0">
            <div
              ref={scrollContainerRef}
              className="no-scrollbar h-full overflow-y-auto"
            >
              <div className="flex flex-col gap-10">
                <AnimatePresence>
                  {/* Requests Section */}
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <motion.div
                      key="requests-section"
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "tween", duration: 0.2 }}
                      className="flex flex-col gap-5"
                    >
                      <motion.h3
                        layout="position"
                        className="text-primary/30 flex items-center gap-2 text-xs font-medium tracking-wide"
                      >
                        Requests{" "}
                        <span className="text-primary/20 select-none">|</span>{" "}
                        {pendingRequests.length}
                      </motion.h3>
                      <div className="flex flex-col gap-6">
                        {pendingRequests.map((f) => (
                          <motion.div
                            layout="position"
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <RequestItem request={f} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  {/* Friends Section */}
                  <motion.div layout="position" className="flex flex-col gap-5">
                    <h3 className="text-primary/30 flex items-center gap-2 text-xs font-medium tracking-wide">
                      Friends{" "}
                      <span className="text-primary/20 select-none">|</span>{" "}
                      {acceptedFriends?.length || 0}
                    </h3>
                    <div className="flex flex-col gap-6">
                      {acceptedFriends?.map((f) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col justify-center tracking-wide"
                        >
                          <span className="text-primary mb-1 text-xs leading-tight font-semibold">
                            {f.friendFirstName} {f.friendLastName}
                          </span>
                          <span className="text-primary/50 text-xs font-medium">
                            @{f.friendUsername}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div
              aria-hidden
              className={cn(
                "from-background pointer-events-none absolute top-0 right-0 left-0 h-15 bg-linear-to-b to-transparent transition-opacity duration-200",
                showTopGradient ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              className={cn(
                "from-background pointer-events-none absolute right-0 bottom-0 left-0 h-15 bg-linear-to-t to-transparent transition-opacity duration-200",
                showBottomGradient ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          {/* Bottom Action */}
          <div>
            <button
              onClick={closeSidebar}
              className="text-primary/50 hover:text-primary/80 flex w-fit cursor-pointer items-center gap-2.5 text-xs font-medium tracking-wider transition-colors duration-300"
            >
              <ChevronLeft className="size-3 stroke-[2.5px]" />
              <span>Back</span>
            </button>
          </div>

          {/* AnimatePresence here lets Modal's exit animations run before unmounting */}
          <AnimatePresence>
            {modal.hasActiveModal && <AddFriendModal onClose={modal.close} />}
          </AnimatePresence>
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
        "flex items-center justify-between pr-6 tracking-wide",
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
      <div className="flex items-center">
        <button
          onClick={() => acceptFriend(request.id)}
          disabled={isPending}
          className="text-primary/50 hover:text-primary flex size-6 items-center justify-center transition-all duration-300 outline-none hover:scale-90"
        >
          <Check className="size-4 stroke-[2.5px]" />
        </button>
        <button
          onClick={() => rejectFriend(request.id)}
          disabled={isPending}
          className="text-primary/50 hover:text-primary flex size-6 items-center justify-center transition-all duration-300 outline-none hover:scale-90"
        >
          <X className="size-4 stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
}
