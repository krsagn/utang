import { useBlocker } from "react-router-dom";
import { useState, useCallback, useRef } from "react";

interface UseUnsavedChangesOptions {
  enabled?: boolean;
  isDirty?: boolean;
}

export function useUnsavedChanges({
  enabled = true,
  isDirty = false,
}: UseUnsavedChangesOptions = {}) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const bypassBlocker = useRef(false);

  const blocker = useBlocker(() => {
    if (bypassBlocker.current) {
      bypassBlocker.current = false;
      return false;
    }
    return enabled && isDirty;
  });

  const showDialog = blocker.state === "blocked" || pendingAction !== null;

  const confirmDiscard = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      bypassBlocker.current = true;
      blocker.proceed?.();
    }
  }, [blocker, pendingAction]);

  const cancelDiscard = useCallback(() => {
    setPendingAction(null);
    blocker.reset?.();
  }, [blocker]);

  const requestDiscard = useCallback((onConfirm: () => void) => {
    setPendingAction(() => onConfirm);
  }, []);

  const bypassDiscard = useCallback(() => {
    setPendingAction(null);
    bypassBlocker.current = true;

    if (blocker.state === "blocked") {
      blocker.proceed?.();
    }
  }, [blocker]);

  return {
    showDialog,
    confirmDiscard,
    cancelDiscard,
    requestDiscard,
    bypassDiscard,
  };
}
