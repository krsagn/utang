import { useState } from "react";

export function useModal() {
  // use string identifier for modals, null if closed
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return {
    isOpen: (modalId: string) => activeModal === modalId,
    open: (modalId: string) => setActiveModal(modalId),
    close: () => setActiveModal(null),
  };
}
