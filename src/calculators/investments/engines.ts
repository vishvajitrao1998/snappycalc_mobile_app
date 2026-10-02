export type GrowthPoint = { year: number; invested: number; gains: number };
export type GrowthResult = { invested: number; gains: number; total: number; yearly: GrowthPoint[] };

/** SIP: monthly investment at the start of each month, compounded monthly. */
export function calculateSip(monthly: number, annualRate: number, years: number): GrowthResult {
  const i = annualRate / 12 / 100;
  const n = Math.round(years * 12);
  let balance = 0;
  let invested = 0;
  const yearly: GrowthPoint[] = [];
  for (let m = 1; m <= n; m++) {
    balance = (balance + monthly) * (1 + i);
    invested += monthly;
    if (m % 12 === 0 || m === n) yearly.push({ year: Math.ceil(m / 12), invested, gains: balance - invested });
  }
  return { invested, gains: balance - invested, total: balance, yearly };
}

/** Lumpsum: P * (1 + r)^t, compounded yearly. */
export function calculateLumpsum(principal: number, annualRate: number, years: number): GrowthResult {
  const value = (t: number) => principal * Math.pow(1 + annualRate / 100, t);
  const yearly: GrowthPoint[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    yearly.push({ year: y, invested: principal, gains: value(Math.min(y, years)) - principal });
  }
  const total = value(years);
  return { invested: principal, gains: total - principal, total, yearly };
}

/** FD: P * (1 + r/n)^(n*t), n = compounding periods per year. */
export function calculateFd(principal: number, annualRate: number, years: number, periodsPerYear: number): GrowthResult {
  const value = (t: number) => principal * Math.pow(1 + annualRate / 100 / periodsPerYear, periodsPerYear * t);
  const yearly: GrowthPoint[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    yearly.push({ year: y, invested: principal, gains: value(Math.min(y, years)) - principal });
  }
  const total = value(years);
  return { invested: principal, gains: total - principal, total, yearly };
}
