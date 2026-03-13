import { useBlocker } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";

interface UseUnsavedChangesOptions {
  enabled?: boolean;
  isDirty?: boolean;
}

export function useUnsavedChanges({
  enabled = true,
  isDirty = false,
}: UseUnsavedChangesOptions = {}) {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const bypassBlocker = useRef(false);

  const blocker = useBlocker(() => {
    if (bypassBlocker.current) {
      bypassBlocker.current = false;
      return false;
    }
    return enabled && isDirty;
  });

  useEffect(() => {
    if (blocker.state === "blocked" && !showDialog) {
      setShowDialog(true);
      setPendingAction(() => blocker.proceed);
    }
  }, [blocker.state, blocker.proceed, showDialog]);

  const confirmDiscard = useCallback(() => {
    setShowDialog(false);
    bypassBlocker.current = true;
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const cancelDiscard = useCallback(() => {
    setShowDialog(false);
    blocker.reset?.();
    setPendingAction(null);
  }, [blocker]);

  const requestDiscard = useCallback((onConfirm: () => void) => {
    setShowDialog(true);
    setPendingAction(() => onConfirm);
  }, []);

  return {
    showDialog,
    confirmDiscard,
    cancelDiscard,
    requestDiscard,
  };
}
