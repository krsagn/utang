export function parseLocalDate(str: string): Date {
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date(NaN);
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}
