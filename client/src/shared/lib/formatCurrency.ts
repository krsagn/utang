const numberFormatters = new Map<string, Intl.NumberFormat>();
const compactFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number | string, currency: string) {
  if (!numberFormatters.has(currency)) {
    numberFormatters.set(
      currency,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    );
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return numberFormatters.get(currency)!.format(num);
}

export function formatCompactCurrency(
  amount: number | string,
  currency: string,
) {
  if (!compactFormatters.has(currency)) {
    compactFormatters.set(
      currency,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        currencyDisplay: "narrowSymbol",
        notation: "compact",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    );
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return compactFormatters.get(currency)!.format(num);
}
