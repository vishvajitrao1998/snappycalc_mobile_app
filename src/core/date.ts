export type DateParts = { day: string; month: string; year: string };

/** Returns a UTC date at midnight, or null if the parts are not a real calendar date. */
export function toUtcDate({ day, month, year }: DateParts): Date | null {
  const d = Number(day), m = Number(month), y = Number(year);
  if (!d || !m || !y || year.length !== 4 || y < 1900 || y > 2200) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}

export function todayParts(): DateParts {
  const n = new Date();
  return { day: String(n.getDate()), month: String(n.getMonth() + 1), year: String(n.getFullYear()) };
}
