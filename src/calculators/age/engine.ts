const DAY = 86_400_000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  daysToNextBirthday: number;
  nextBirthdayWeekday: string;
  bornOnWeekday: string;
};

/** Both dates are UTC midnight (see core/date.ts). Returns null if asOf is before dob. */
export function calculateAge(dob: Date, asOf: Date): AgeResult | null {
  if (asOf < dob) return null;

  let years = asOf.getUTCFullYear() - dob.getUTCFullYear();
  let months = asOf.getUTCMonth() - dob.getUTCMonth();
  let days = asOf.getUTCDate() - dob.getUTCDate();
  if (days < 0) {
    months--;
    days += new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / DAY);
  // Feb 29 birthdays roll to Mar 1 in non-leap years (Date.UTC overflow).
  let next = new Date(Date.UTC(asOf.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()));
  if (next < asOf) next = new Date(Date.UTC(asOf.getUTCFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate()));

  return {
    years,
    months,
    days,
    totalMonths: years * 12 + months,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
    totalHours: totalDays * 24,
    daysToNextBirthday: Math.round((next.getTime() - asOf.getTime()) / DAY),
    nextBirthdayWeekday: WEEKDAYS[next.getUTCDay()],
    bornOnWeekday: WEEKDAYS[dob.getUTCDay()],
  };
}
