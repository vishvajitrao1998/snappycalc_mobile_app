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

/** Step-up SIP: the monthly amount rises by stepUpPct at the start of every year. */
export function calculateStepUpSip(monthly: number, stepUpPct: number, annualRate: number, years: number): GrowthResult {
  const i = annualRate / 12 / 100;
  let balance = 0;
  let invested = 0;
  let current = monthly;
  const yearly: GrowthPoint[] = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = (balance + current) * (1 + i);
      invested += current;
    }
    yearly.push({ year: y, invested, gains: balance - invested });
    current *= 1 + stepUpPct / 100;
  }
  return { invested, gains: balance - invested, total: balance, yearly };
}

/** PPF: deposit at the start of each financial year, interest compounded yearly. */
export function calculatePpf(yearlyDeposit: number, annualRate: number, years: number): GrowthResult {
  const r = annualRate / 100;
  let balance = 0;
  const yearly: GrowthPoint[] = [];
  for (let y = 1; y <= years; y++) {
    balance = (balance + yearlyDeposit) * (1 + r);
    yearly.push({ year: y, invested: yearlyDeposit * y, gains: balance - yearlyDeposit * y });
  }
  return { invested: yearlyDeposit * years, gains: balance - yearlyDeposit * years, total: balance, yearly };
}

export type EpfInput = { basic: number; age: number; retireAge: number; raisePct: number; ratePct: number };

/**
 * EPF: employee 12% of basic; employer 12% minus the EPS share (8.33% of wages capped at 15,000).
 * Interest accrues monthly on the running balance and is credited at year end.
 */
export function calculateEpf({ basic, age, retireAge, raisePct, ratePct }: EpfInput) {
  const years = Math.max(0, retireAge - age);
  const r = ratePct / 100 / 12;
  let balance = 0;
  let employee = 0;
  let employer = 0;
  let salary = basic;
  const yearly: GrowthPoint[] = [];
  for (let y = 1; y <= years; y++) {
    let accrued = 0;
    for (let m = 0; m < 12; m++) {
      const emp = 0.12 * salary;
      const er = 0.12 * salary - 0.0833 * Math.min(salary, 15000);
      balance += emp + er;
      employee += emp;
      employer += er;
      accrued += balance * r;
    }
    balance += accrued;
    salary *= 1 + raisePct / 100;
    yearly.push({ year: y, invested: employee + employer, gains: balance - employee - employer });
  }
  const invested = employee + employer;
  return { employee, employer, result: { invested, gains: balance - invested, total: balance, yearly } as GrowthResult };
}

export type SwpYear = { year: number; balance: number; withdrawn: number };

/** SWP: withdraw at the start of each month, remaining balance then earns monthly interest. */
export function calculateSwp(corpus: number, withdrawal: number, annualRate: number, years: number) {
  const i = annualRate / 12 / 100;
  const n = Math.round(years * 12);
  let balance = corpus;
  let withdrawn = 0;
  let lastedMonths: number | null = null;
  const yearly: SwpYear[] = [];
  for (let m = 1; m <= n; m++) {
    if (balance < withdrawal && lastedMonths === null) lastedMonths = m - 1;
    const w = Math.min(withdrawal, balance);
    balance -= w;
    withdrawn += w;
    balance *= 1 + i;
    if (m % 12 === 0 || m === n) yearly.push({ year: Math.ceil(m / 12), balance, withdrawn });
  }
  return { finalValue: balance, totalWithdrawn: withdrawn, lastedMonths, yearly };
}

export function calculateCagr(initial: number, final: number, years: number) {
  const ratio = final / initial;
  const yearly: GrowthPoint[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    const value = initial * Math.pow(ratio, Math.min(y, years) / years);
    yearly.push({ year: y, invested: Math.min(initial, value), gains: Math.max(0, value - initial) });
  }
  return { cagr: (Math.pow(ratio, 1 / years) - 1) * 100, absolute: (ratio - 1) * 100, gain: final - initial, yearly };
}

/** Monthly SIP needed to reach `target` (same convention as calculateSip). */
export function requiredSip(target: number, annualRate: number, years: number): number {
  const i = annualRate / 12 / 100;
  const n = Math.round(years * 12);
  return i === 0 ? target / n : (target * i) / ((Math.pow(1 + i, n) - 1) * (1 + i));
}

export type RetirementInput = {
  age: number;
  retireAge: number;
  lifeExpectancy: number;
  monthlyExpense: number;
  inflation: number;
  preReturn: number;
  postReturn: number;
  savings: number;
};

export function calculateRetirement(p: RetirementInput) {
  const yearsToRet = p.retireAge - p.age;
  const yearsInRet = p.lifeExpectancy - p.retireAge;
  const expenseAtRetirement = p.monthlyExpense * Math.pow(1 + p.inflation / 100, yearsToRet);

  // Annual expenses withdrawn at the start of each year, growing with inflation, discounted at the real return.
  const g = (1 + p.postReturn / 100) / (1 + p.inflation / 100) - 1;
  const first = expenseAtRetirement * 12;
  const corpus = Math.abs(g) < 1e-9 ? first * yearsInRet : (first * (1 - Math.pow(1 + g, -yearsInRet)) * (1 + g)) / g;

  const i = p.preReturn / 12 / 100;
  const savingsFv = p.savings * Math.pow(1 + i, yearsToRet * 12);
  const shortfall = Math.max(0, corpus - savingsFv);
  const sip = shortfall === 0 ? 0 : requiredSip(shortfall, p.preReturn, yearsToRet);
  const sipResult = calculateSip(sip, p.preReturn, yearsToRet);

  const yearly: GrowthPoint[] = sipResult.yearly.map((pt) => ({
    year: pt.year,
    invested: pt.invested + p.savings,
    gains: pt.gains + p.savings * (Math.pow(1 + i, 12 * pt.year) - 1),
  }));
  const invested = p.savings + sipResult.invested;
  const total = savingsFv + sipResult.total;
  return {
    yearsToRet, yearsInRet, expenseAtRetirement, corpus, savingsFv, shortfall, sip,
    result: { invested, gains: total - invested, total, yearly } as GrowthResult,
  };
}
