import { useState, useEffect } from "react";

export function useBreakpoint(width: number): boolean {
  const query = `(min-width: ${width}px)`;
  const [matches, setMatches] = useState<boolean>(
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
