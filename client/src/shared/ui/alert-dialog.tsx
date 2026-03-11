import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { motion } from "framer-motion";

import { cn } from "../lib";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 bg-black/40"
        />
      </AlertDialogPrimitive.Overlay>
      <AlertDialogPrimitive.Content asChild {...props}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 25,
          }}
          className={cn(
            "fixed top-1/2 left-1/2 z-60 w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-4xl bg-white p-6 shadow-2xl outline-hidden sm:w-sm",
            className,
          )}
        >
          {children}
        </motion.div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-bold tracking-tight text-primary", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm leading-relaxed text-primary/50", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(
        "inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-(--color-outgoing) text-sm font-semibold tracking-wide text-white transition-colors outline-none hover:bg-(--color-outgoing-hover) active:bg-(--color-outgoing-active)",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(
        "inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-primary/5 text-sm font-semibold tracking-wide text-primary transition-colors outline-none hover:bg-primary/10 active:bg-primary/15",
        className,
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
