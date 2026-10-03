const DAY = 86_400_000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ───────────── Dates (all UTC midnight, see core/date.ts) ───────────── */
export const formatDate = (d: Date) => `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const weekdayOf = (d: Date) => WEEKDAYS[d.getUTCDay()];
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

function addMonthsClamped(d: Date, n: number) {
  const target = d.getUTCMonth() + n;
  const y = d.getUTCFullYear() + Math.floor(target / 12);
  const m = ((target % 12) + 12) % 12;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last)));
}

/** Calendar difference (b must not be before a). Month-end safe: 31 Jan to 1 Mar is 1 month 1 day. */
export function diffYmd(a: Date, b: Date) {
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  let anchor = addMonthsClamped(a, months);
  if (anchor > b) {
    months--;
    anchor = addMonthsClamped(a, months);
  }
  return { years: Math.floor(months / 12), months: months % 12, days: daysBetween(anchor, b) };
}

/** Number of Mon-Fri days in [a, a + n days). */
export function weekdaysIn(a: Date, n: number) {
  let count = Math.floor(n / 7) * 5;
  const start = addDays(a, Math.floor(n / 7) * 7);
  for (let i = 0; i < n % 7; i++) {
    const wd = addDays(start, i).getUTCDay();
    if (wd !== 0 && wd !== 6) count++;
  }
  return count;
}

export function dateDifference(from: Date, to: Date, includeEnd: boolean) {
  const swapped = to < from;
  const [a, b] = swapped ? [to, from] : [from, to];
  const days = daysBetween(a, b) + (includeEnd ? 1 : 0);
  const ymd = diffYmd(a, includeEnd ? addDays(b, 1) : b);
  return {
    swapped, ...ymd, totalDays: days,
    weeks: Math.floor(days / 7), remDays: days % 7,
    totalMonths: ymd.years * 12 + ymd.months,
    hours: days * 24, business: weekdaysIn(a, days),
  };
}

const ZODIAC: [number, number, string][] = [
  [1, 20, 'Aquarius'], [2, 19, 'Pisces'], [3, 21, 'Aries'], [4, 20, 'Taurus'], [5, 21, 'Gemini'], [6, 21, 'Cancer'],
  [7, 23, 'Leo'], [8, 23, 'Virgo'], [9, 23, 'Libra'], [10, 23, 'Scorpio'], [11, 22, 'Sagittarius'], [12, 22, 'Capricorn'],
];
export function zodiac(month: number, day: number) {
  let sign = 'Capricorn';
  for (const [m, d, s] of ZODIAC) if (month > m || (month === m && day >= d)) sign = s;
  return sign;
}

export function birthdayInfo(dob: Date, today: Date) {
  if (today < dob) return null;
  let next = new Date(Date.UTC(today.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()));
  if (next < today) next = new Date(Date.UTC(today.getUTCFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate()));
  const milestones = [
    { label: '5,000 days old', days: 5_000 },
    { label: '10,000 days old', days: 10_000 },
    { label: '15,000 days old', days: 15_000 },
    { label: '20,000 days old', days: 20_000 },
    { label: '1 billion seconds old', days: Math.round(1e9 / 86_400) },
  ].map((m) => {
    const date = addDays(dob, m.days);
    return { label: m.label, date, fromToday: daysBetween(today, date) };
  });
  return {
    age: diffYmd(dob, today),
    totalDays: daysBetween(dob, today),
    next, turning: next.getUTCFullYear() - dob.getUTCFullYear(),
    daysToNext: daysBetween(today, next), countdown: diffYmd(today, next),
    bornOn: weekdayOf(dob), zodiac: zodiac(dob.getUTCMonth() + 1, dob.getUTCDate()), milestones,
  };
}

/* ───────────── Body & nutrition ───────────── */
export const BMI_LABELS = ['Underweight', 'Normal', 'Overweight', 'Obese'];
export const BMI_CUTS = { who: [18.5, 25, 30], asian: [18.5, 23, 25] };

export function calculateBmi(kg: number, cm: number, scale: 'who' | 'asian') {
  const m = cm / 100;
  const bmi = kg / (m * m);
  const cuts = BMI_CUTS[scale];
  const idx = bmi < cuts[0] ? 0 : bmi < cuts[1] ? 1 : bmi < cuts[2] ? 2 : 3;
  return { bmi, cuts, idx, label: BMI_LABELS[idx], healthyMin: 18.5 * m * m, healthyMax: (cuts[1] - 0.1) * m * m };
}

export type Sex = 'male' | 'female';
export type BmrFormula = 'mifflin' | 'harris';

export function calculateBmr(sex: Sex, kg: number, cm: number, age: number, formula: BmrFormula) {
  if (formula === 'harris') {
    return sex === 'male' ? 88.362 + 13.397 * kg + 4.799 * cm - 5.677 * age : 447.593 + 9.247 * kg + 3.098 * cm - 4.33 * age;
  }
  return 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
}

export const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise', factor: 1.2 },
  { value: 'light', label: 'Lightly active', hint: 'Exercise 1 to 3 days a week', factor: 1.375 },
  { value: 'moderate', label: 'Moderately active', hint: 'Exercise 3 to 5 days a week', factor: 1.55 },
  { value: 'active', label: 'Very active', hint: 'Hard exercise 6 to 7 days a week', factor: 1.725 },
  { value: 'extra', label: 'Extra active', hint: 'Physical job plus hard training', factor: 1.9 },
] as const;

export const MACROS = {
  balanced: { label: 'Balanced', p: 30, c: 40, f: 30 },
  lowcarb: { label: 'Lower carb', p: 35, c: 25, f: 40 },
  highcarb: { label: 'Higher carb', p: 20, c: 55, f: 25 },
} as const;

export function calculateCalories(p: {
  sex: Sex; bmr: number; factor: number; goal: 'lose' | 'maintain' | 'gain'; pace: number; bmi: number; macro: keyof typeof MACROS;
}) {
  const maintenance = p.bmr * p.factor;
  const floor = p.sex === 'male' ? 1500 : 1200;
  const lowBmi = p.goal === 'lose' && p.bmi < 18.5;
  let target = maintenance + (p.goal === 'lose' ? -p.pace : p.goal === 'gain' ? p.pace : 0);
  let capped = false;
  if (lowBmi) target = maintenance;
  else if (p.goal === 'lose' && target < Math.min(floor, maintenance)) {
    target = Math.min(floor, maintenance);
    capped = true;
  } else if (p.goal === 'lose' && target < floor) {
    target = Math.min(floor, maintenance);
    capped = true;
  }
  const m = MACROS[p.macro];
  return {
    maintenance, target, capped, lowBmi,
    weeklyKg: ((target - maintenance) * 7) / 7700,
    protein: (target * m.p) / 100 / 4, carbs: (target * m.c) / 100 / 4, fat: (target * m.f) / 100 / 9,
  };
}

/* ───────────── Formatting ───────────── */
export const fmtNumber = (n: number, max = 4) => n.toLocaleString('en-IN', { maximumFractionDigits: max });
