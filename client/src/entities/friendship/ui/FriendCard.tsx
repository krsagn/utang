import type { Friendship } from "../model/types";
import { PopoverContent, PopoverTrigger, Popover } from "@/shared/ui";
import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { UsersGroupRounded } from "@solar-icons/react";
import { useState, type ReactNode } from "react";

type FriendCardProps = Pick<
  Friendship,
  | "friendFirstName"
  | "friendLastName"
  | "friendUsername"
  | "status"
  | "updatedAt"
  | "createdAt"
> & {
  action?: (close: () => void) => ReactNode;
};

export function FriendCard({
  friendFirstName,
  friendLastName,
  friendUsername,
  status,
  updatedAt,
  createdAt,
  action,
}: FriendCardProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);

  return (
    <article className="bg-card relative flex w-full justify-between overflow-hidden rounded-3xl p-7 tracking-wide transition duration-300">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-xl font-extrabold">
            {friendFirstName} {friendLastName}
          </h3>
          <UsersGroupRounded
            weight="BoldDuotone"
            className="text-primary size-4"
          />
        </div>
        <div className="text-primary/50 flex items-center gap-3 text-sm font-medium">
          <p>@{friendUsername}</p>
          <div className="bg-primary/50 size-0.75 rounded-full" />
          {status === "accepted" ? (
            <p>Friends since {format(new Date(updatedAt), "MMM d, yyyy")}</p>
          ) : (
            <p>
              Requested{" "}
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end">
        {status === "pending" ? (
          action?.(setOptionsOpen.bind(null, false))
        ) : (
          <Popover open={optionsOpen} onOpenChange={setOptionsOpen}>
            <PopoverTrigger asChild>
              <button className="text-primary/40 hover:bg-primary/5 hover:text-primary active:bg-primary/10 flex size-8 items-center justify-center rounded-full transition-colors outline-none">
                <MoreHorizontal className="size-5" strokeWidth={2.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-fit overflow-hidden rounded-xl p-1"
              align="end"
            >
              <div className="flex flex-col">
                {action?.(() => setOptionsOpen(false))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </article>
  );
}
