import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, Calendar } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { ChevronDownIcon } from "lucide-react";

export function DatePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "squircle border-primary/10 focus-within:border-primary/20 flex flex-1 items-center overflow-hidden border bg-transparent transition-colors",
        open && "border-primary/20",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-primary relative flex h-full w-full min-w-0 items-center gap-2 bg-transparent p-3 text-xs tracking-wide outline-none",
              value && "font-medium",
            )}
          >
            {value ? (
              value.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            ) : (
              <span className="opacity-25">Due By?</span>
            )}
            <ChevronDownIcon
              data-slot="date-picker-trigger-icon"
              className={cn(
                "text-primary pointer-events-none absolute right-2.25 size-4 stroke-[1.5px] transition-[opacity,rotate] duration-300",
                open ? "rotate-180 opacity-40" : "opacity-30",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="squircle-dialog w-auto p-0"
          align="start"
          side="bottom"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date: Date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
