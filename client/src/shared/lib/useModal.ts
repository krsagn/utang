import { useSearchParams } from "react-router-dom";

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
  };
}
