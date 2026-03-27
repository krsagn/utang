import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, Calendar } from "@/shared/ui";
import { cn } from "@/shared/lib";

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
        "squircle border-primary/10 flex flex-1 items-center overflow-hidden border bg-transparent transition-colors",
        open && "border-primary/20",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-primary flex h-full w-full min-w-0 items-center gap-2 bg-transparent p-3 text-xs tracking-wide outline-none",
              value ? "font-medium" : "opacity-25",
            )}
          >
            {value ? (
              value.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            ) : (
              <span>Deadline (Optional)</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
