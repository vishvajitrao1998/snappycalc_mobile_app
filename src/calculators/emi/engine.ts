// Pure logic: no React, no UI. Easy to unit test and reuse (home loan, car loan, etc.).

export type EmiInput = { principal: number; annualRate: number; tenureMonths: number };

export type ScheduleRow = { month: number; emi: number; principal: number; interest: number; balance: number };
export type YearRow = { year: number; principal: number; interest: number; balance: number; months: ScheduleRow[] };

export type EmiResult = {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: ScheduleRow[];
  yearly: YearRow[];
};

export function calculateEmi({ principal, annualRate, tenureMonths }: EmiInput): EmiResult {
  const n = Math.max(1, Math.round(tenureMonths));
  const r = annualRate / 12 / 100;
  const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  let balance = principal;
  const schedule: ScheduleRow[] = [];
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const princ = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - princ);
    schedule.push({ month: m, emi, principal: princ, interest, balance });
  }

  const yearly: YearRow[] = [];
  schedule.forEach((row) => {
    const y = Math.ceil(row.month / 12);
    let bucket = yearly[y - 1];
    if (!bucket) {
      bucket = { year: y, principal: 0, interest: 0, balance: 0, months: [] };
      yearly[y - 1] = bucket;
    }
    bucket.principal += row.principal;
    bucket.interest += row.interest;
    bucket.balance = row.balance;
    bucket.months.push(row);
  });

  const totalPayment = emi * n;
  return { emi, totalInterest: totalPayment - principal, totalPayment, schedule, yearly };
}
