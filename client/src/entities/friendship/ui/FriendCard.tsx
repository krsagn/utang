import type { Friendship } from "../model/types";
import { Button, PopoverContent, PopoverTrigger, Popover } from "@/shared/ui";
import { Check, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { TrashBinTrash, UsersGroupRounded } from "@solar-icons/react";
import { useState } from "react";

type FriendCardProps = Pick<
  Friendship,
  | "id"
  | "friendFirstName"
  | "friendLastName"
  | "friendUsername"
  | "status"
  | "updatedAt"
  | "createdAt"
>;

export function FriendCard({
  id, // TODO: wire up accept/delete mutations
  friendFirstName,
  friendLastName,
  friendUsername,
  status,
  updatedAt,
  createdAt,
}: FriendCardProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);

  return (
    <article className="bg-card relative flex w-full flex-1 justify-between overflow-hidden rounded-3xl p-7 tracking-wide transition duration-300">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-xl font-extrabold">
            {friendFirstName} {friendLastName}
          </h3>
          <UsersGroupRounded
            weight="BoldDuotone"
            className="size-4 text-black"
          />
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-black/50">
          <p>@{friendUsername}</p>
          <div className="size-0.75 rounded-full bg-black/50" />
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
          <Button variant="default" className="rounded-xl p-5">
            <Check className="size-4 shrink-0 stroke-[2.5px]" />
            Accept
          </Button>
        ) : (
          <Popover open={optionsOpen} onOpenChange={setOptionsOpen}>
            <PopoverTrigger asChild>
              <button className="flex size-8 items-center justify-center rounded-full text-black/40 transition-colors outline-none hover:bg-black/5 hover:text-black active:bg-black/10">
                <MoreHorizontal className="size-5" strokeWidth={2.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-fit overflow-hidden rounded-xl p-1"
              align="end"
            >
              <div className="flex flex-col">
                <button
                  className="group flex w-fit items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[#AF1D1D] transition-colors outline-none hover:bg-[#AF1D1D]/10"
                  onClick={() => {
                    setOptionsOpen(false);
                  }}
                >
                  <TrashBinTrash
                    weight="BoldDuotone"
                    className="size-4 opacity-60 transition-opacity group-hover:opacity-100"
                  />
                  <span>Remove Friend</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </article>
  );
}
