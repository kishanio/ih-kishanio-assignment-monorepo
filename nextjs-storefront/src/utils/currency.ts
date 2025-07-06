export const CURRENCY_CODES: Record<string, string> = {
  inr: "₹",
  usd: "$",
  eur: "€",
  gbp: "£",
};

export const getCurrencySymbol = function (currencyCode: string): string {
  return CURRENCY_CODES[currencyCode] || currencyCode.toUpperCase();
};