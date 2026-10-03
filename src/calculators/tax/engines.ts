// All rates are for FY 2026-27 (Income-tax Act, 2025 in force from 1 April 2026). Review each Budget.

/* ───────────── Income tax ───────────── */
export type AgeGroup = 'below60' | '60to79' | '80plus';
export type Slabs = [upTo: number, rate: number][];

export const NEW_SLABS: Slabs = [[400000, 0], [800000, 0.05], [1200000, 0.1], [1600000, 0.15], [2000000, 0.2], [2400000, 0.25], [Infinity, 0.3]];
export const OLD_SLABS: Record<AgeGroup, Slabs> = {
  below60: [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]],
  '60to79': [[300000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]],
  '80plus': [[500000, 0], [1000000, 0.2], [Infinity, 0.3]],
};
const NEW_SURCHARGE = [{ above: 20_000_000, rate: 0.25 }, { above: 10_000_000, rate: 0.15 }, { above: 5_000_000, rate: 0.1 }];
const OLD_SURCHARGE = [{ above: 50_000_000, rate: 0.37 }, ...NEW_SURCHARGE];

export function slabTax(income: number, slabs: Slabs): number {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (income > prev) tax += (Math.min(income, limit) - prev) * rate;
    prev = limit;
  }
  return tax;
}

/** Surcharge with marginal relief at each threshold. */
function surchargeOf(income: number, slabs: Slabs, tiers: { above: number; rate: number }[]): number {
  const idx = tiers.findIndex((t) => income > t.above);
  if (idx < 0) return 0;
  const t = tiers[idx];
  const prevRate = tiers[idx + 1]?.rate ?? 0;
  const tax = slabTax(income, slabs);
  const limit = slabTax(t.above, slabs) * (1 + prevRate) + (income - t.above);
  return Math.max(0, Math.min(tax * (1 + t.rate), limit) - tax);
}

export type IncomeTaxInput = {
  gross: number;
  otherIncome: number;
  salaried: boolean;
  age: AgeGroup;
  employerNps: number;
  d80c: number;
  d80d: number;
  hraExemption: number;
  homeLoanInterest: number;
  nps1b: number;
  otherDeductions: number;
};

export type RegimeResult = {
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
};

function finish(totalIncome: number, taxable: number, slabs: Slabs, tiers: typeof NEW_SURCHARGE, rebate: (tax: number) => number): RegimeResult {
  const base = slabTax(taxable, slabs);
  const reb = rebate(base);
  const surcharge = surchargeOf(taxable, slabs, tiers);
  const cess = 0.04 * (base - reb + surcharge);
  const totalTax = base - reb + surcharge + cess;
  return { taxableIncome: taxable, slabTax: base, rebate: reb, surcharge, cess, totalTax, effectiveRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0 };
}

export function calculateIncomeTax(i: IncomeTaxInput) {
  const total = i.gross + i.otherIncome;

  const newTaxable = Math.max(0, total - (i.salaried ? 75_000 : 0) - i.employerNps);
  const newRes = finish(total, newTaxable, NEW_SLABS, NEW_SURCHARGE, (tax) =>
    newTaxable <= 1_200_000 ? Math.min(tax, 60_000) : Math.max(0, tax - (newTaxable - 1_200_000)),
  );

  const oldDeductions =
    (i.salaried ? 50_000 : 0) + i.hraExemption + Math.min(i.d80c, 150_000) + Math.min(i.d80d, 100_000) +
    Math.min(i.homeLoanInterest, 200_000) + Math.min(i.nps1b, 50_000) + i.employerNps + i.otherDeductions;
  const oldTaxable = Math.max(0, total - oldDeductions);
  const oldRes = finish(total, oldTaxable, OLD_SLABS[i.age], OLD_SURCHARGE, (tax) => (oldTaxable <= 500_000 ? Math.min(tax, 12_500) : 0));

  const better = newRes.totalTax <= oldRes.totalTax ? 'new' : 'old';
  return { total, new: newRes, old: oldRes, better: better as 'new' | 'old', saving: Math.abs(newRes.totalTax - oldRes.totalTax) };
}

/* ───────────── Salary / CTC to in-hand ───────────── */
export type SalaryInput = {
  ctc: number;
  basicPct: number;
  hraPctOfBasic: number;
  variable: number;
  pfCapped: boolean;
  gratuityInCtc: boolean;
  professionalTax: number;
};

export function calculateSalary(s: SalaryInput) {
  const basic = (s.ctc * s.basicPct) / 100;
  const hra = (basic * s.hraPctOfBasic) / 100;
  const pfWage = s.pfCapped ? Math.min(basic, 15_000 * 12) : basic;
  const employerPf = 0.12 * pfWage;
  const employeePf = 0.12 * pfWage;
  const gratuity = s.gratuityInCtc ? (basic * 15) / 26 / 12 : 0;
  const rawSpecial = s.ctc - basic - hra - employerPf - gratuity - s.variable;
  const special = Math.max(0, rawSpecial);
  const gross = basic + hra + special + s.variable;
  const tax = calculateIncomeTax({
    gross, otherIncome: 0, salaried: true, age: 'below60', employerNps: 0,
    d80c: 0, d80d: 0, hraExemption: 0, homeLoanInterest: 0, nps1b: 0, otherDeductions: 0,
  }).new.totalTax;
  const net = gross - employeePf - s.professionalTax - tax;
  return { basic, hra, special, variable: s.variable, gross, employerPf, employeePf, gratuity, tax, net, overflow: rawSpecial < 0 };
}

/* ───────────── HRA ───────────── */
export function calculateHra(p: { basic: number; da: number; hraReceived: number; rent: number; metro: boolean }) {
  const salary = p.basic + p.da;
  const actual = p.hraReceived;
  const rentMinus = Math.max(0, p.rent - 0.1 * salary);
  const cityLimit = salary * (p.metro ? 0.5 : 0.4);
  const exempt = Math.max(0, Math.min(actual, rentMinus, cityLimit));
  return { actual, rentMinus, cityLimit, exempt, taxable: Math.max(0, actual - exempt) };
}

/* ───────────── TDS (resident payee) ───────────── */
export type TdsRule = {
  id: string;
  label: string;
  section: string; // earlier section number
  rate: number;
  threshold: number;
  period: string;
  seniorThreshold?: number;
  onExcess?: boolean;
};

export const TDS_RULES: TdsRule[] = [
  { id: 'prof', label: 'Professional fees', section: '194J', rate: 10, threshold: 50_000, period: 'per year' },
  { id: 'tech', label: 'Technical services / call centre', section: '194J', rate: 2, threshold: 50_000, period: 'per year' },
  { id: 'contract-ind', label: 'Contractor: individual / HUF', section: '194C', rate: 1, threshold: 30_000, period: 'per payment (₹1,00,000 a year)' },
  { id: 'contract-co', label: 'Contractor: company / firm', section: '194C', rate: 2, threshold: 30_000, period: 'per payment (₹1,00,000 a year)' },
  { id: 'comm', label: 'Commission / brokerage', section: '194H', rate: 2, threshold: 20_000, period: 'per year' },
  { id: 'ins', label: 'Insurance commission', section: '194D', rate: 2, threshold: 20_000, period: 'per year' },
  { id: 'rent-b', label: 'Rent: land, building, furniture', section: '194I(b)', rate: 10, threshold: 50_000, period: 'per month' },
  { id: 'rent-m', label: 'Rent: plant & machinery', section: '194I(a)', rate: 2, threshold: 50_000, period: 'per month' },
  { id: 'rent-i', label: 'Rent paid by individual / HUF', section: '194-IB', rate: 2, threshold: 50_000, period: 'per month' },
  { id: 'int-bank', label: 'Interest: bank / post office', section: '194A', rate: 10, threshold: 50_000, seniorThreshold: 100_000, period: 'per year' },
  { id: 'int-other', label: 'Interest: other', section: '194A', rate: 10, threshold: 10_000, period: 'per year' },
  { id: 'div', label: 'Dividend', section: '194', rate: 10, threshold: 10_000, period: 'per year' },
  { id: 'goods', label: 'Purchase of goods', section: '194Q', rate: 0.1, threshold: 5_000_000, period: 'per year, on the excess', onExcess: true },
  { id: 'epf', label: 'Premature EPF withdrawal', section: '192A', rate: 10, threshold: 50_000, period: 'per withdrawal' },
];

export function calculateTds(rule: TdsRule, amount: number, hasPan: boolean, senior: boolean) {
  const threshold = senior && rule.seniorThreshold ? rule.seniorThreshold : rule.threshold;
  const baseRate = rule.id === 'goods' ? 5 : 20;
  const rate = hasPan ? rule.rate : Math.max(rule.rate, baseRate);
  const applicable = amount > threshold;
  const taxable = applicable ? (rule.onExcess ? amount - threshold : amount) : 0;
  const tds = (taxable * rate) / 100;
  return { threshold, rate, applicable, tds, net: amount - tds };
}

/* ───────────── Gratuity ───────────── */
export const GRATUITY_CAP = 2_000_000;

export function calculateGratuity(p: { wages: number; monthlyCtc: number; years: number; months: number; fixedTerm: boolean }) {
  const wages = p.monthlyCtc > 0 ? Math.max(p.wages, p.monthlyCtc * 0.5) : p.wages; // 50% wage rule
  const serviceYears = p.years + (p.months >= 6 ? 1 : 0);
  const minMonths = (p.fixedTerm ? 1 : 5) * 12;
  const eligible = p.years * 12 + p.months >= minMonths;
  const perYear = (wages * 15) / 26;
  const formula = perYear * serviceYears;
  const payable = Math.min(formula, GRATUITY_CAP);
  return { wages, serviceYears, eligible, perYear, formula, payable, aboveCap: Math.max(0, formula - GRATUITY_CAP), minYears: p.fixedTerm ? 1 : 5 };
}

/* ───────────── Capital gains ───────────── */
export type CgAsset = 'equity' | 'property' | 'other' | 'debt';

export function calculateCapitalGains(p: {
  asset: CgAsset; buy: number; sell: number; expenses: number; months: number; slabRate: number; otherEquityLtcg: number;
}) {
  const gain = p.sell - p.expenses - p.buy;
  const longTerm = p.asset === 'equity' ? p.months > 12 : p.asset === 'debt' ? false : p.months > 24;
  const exemptLeft = Math.max(0, 125_000 - p.otherEquityLtcg);

  let rate: number;
  let exemption = 0;
  let slabBased = false;
  if (p.asset === 'equity') rate = longTerm ? 12.5 : 20;
  else if (p.asset === 'debt') { rate = p.slabRate; slabBased = true; }
  else if (longTerm) rate = 12.5;
  else { rate = p.slabRate; slabBased = true; }

  if (p.asset === 'equity' && longTerm && gain > 0) exemption = Math.min(gain, exemptLeft);
  const taxableGain = Math.max(0, gain - exemption);
  const tax = (taxableGain * rate) / 100;
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  return { gain, longTerm, rate, slabBased, exemption, taxableGain, tax, cess, totalTax, postTax: gain - totalTax };
}

/* ───────────── GST ───────────── */
export function calculateGst(amount: number, rate: number, mode: 'add' | 'remove') {
  if (mode === 'add') {
    const gst = (amount * rate) / 100;
    return { base: amount, gst, total: amount + gst };
  }
  const base = amount / (1 + rate / 100);
  return { base, gst: amount - base, total: amount };
}
