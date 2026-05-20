import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0",
          "--toast-close-button-transform": "translateY(-50%)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "rounded-[var(--radius-lg)]! text-primary! bg-white/75! border! border-white/20! shadow-lg! backdrop-blur-xs! text-xs! tracking-wide! pr-10! font-sans!",
          error: "pl-6!",
          title: "font-semibold! tracking-wide! [[data-type=error]_&]:ml-2!",
          description: "text-primary/60! [[data-type=error]_&]:ml-2!",
          closeButton:
            "top-1/2! left-auto! right-4! border-none! bg-transparent! rounded-none! opacity-50! transition-[opacity,scale]! duration-300! hover:opacity-90! hover:scale-95! [&>svg]:stroke-[2.5px]! [&>svg]:size-4!",
        },
      }}
      {...props}
    />
  );
}
