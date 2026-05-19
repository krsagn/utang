export function parseLocalDate(str: string): Date {
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date(NaN);
  const [y, m, d] = parts;
  const date = new Date(y!, m! - 1, d!);
  // Reject overflowed calendar values (e.g. "2026-02-31") which JS would
  // otherwise silently normalise into a different month/day.
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m! - 1 ||
    date.getDate() !== d
  ) {
    return new Date(NaN);
  }
  return date;
}
