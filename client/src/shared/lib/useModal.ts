import { useSearchParams } from "react-router-dom";

/**
 * A custom hook that manages global modal state via URL search parameters.
 *
 * Pattern: URL-Driven State
 * By storing the active modal (and optional context ID) in the URL instead of
 * React state, modals become deep-linkable and natively support the browser's
 * back/forward navigation buttons.
 */
export function useModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeModal = searchParams.get("modal");
  const idParam = searchParams.get("id");

  return {
    isOpen: (modalId: string) => activeModal === modalId,
    open: (modalId: string, id?: string) => {
      const newParams = new URLSearchParams(searchParams);

      newParams.set("modal", modalId);
      if (id) {
        newParams.set("id", id);
      }

      setSearchParams(newParams);
    },
    close: () => {
      const newParams = new URLSearchParams(searchParams);

      newParams.delete("modal");
      newParams.delete("id");

      setSearchParams(newParams);
    },
    activeModal,
    idParam,
    hasActiveModal: activeModal !== null,
  };
}
