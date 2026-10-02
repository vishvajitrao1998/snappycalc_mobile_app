// Change these two constants (or wire to user settings) to localise the whole app.
export const LOCALE = 'en-IN';
export const CURRENCY_SYMBOL = '₹';

export const formatCurrency = (n: number) =>
  `${CURRENCY_SYMBOL}${Math.round(n).toLocaleString(LOCALE)}`;

/** Indian compact style (L / Cr). Swap for K/M/B if you add other locales. */
export const formatCompact = (n: number) => {
  if (n >= 1e7) return `${CURRENCY_SYMBOL}${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${CURRENCY_SYMBOL}${(n / 1e5).toFixed(2)} L`;
  return formatCurrency(n);
};