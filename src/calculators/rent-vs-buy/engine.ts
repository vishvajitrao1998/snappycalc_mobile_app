import { calculateEmi } from '../emi/engine';

export type RentVsBuyInput = {
  price: number;
  downPct: number;
  loanRate: number;
  loanYears: number;
  appreciation: number; // % per year
  buyCostPct: number; // stamp duty, registration, etc. (one-time, % of price)
  maintPct: number; // maintenance + property tax, % of property value per year
  rent: number; // monthly rent today
  rentRise: number; // % per year
  invReturn: number; // % per year on money you invest
  years: number; // time horizon
  sellCostPct: number; // % of sale price when you sell at the end
};

export type RvbYear = { year: number; buyNet: number; rentNet: number; value: number; balance: number };

/**
 * Both sides start with the same cash. The buyer puts it into the property (down payment + buying costs);
 * the renter invests it. Every month, whoever pays less invests the difference, so both spend the same total.
 * At the end we compare net worth: buyer = sale proceeds - loan + invested surplus, renter = portfolio.
 */
export function calculateRentVsBuy(p: RentVsBuyInput) {
  const down = (p.price * p.downPct) / 100;
  const buyCosts = (p.price * p.buyCostPct) / 100;
  const upfront = down + buyCosts;
  const loan = p.price - down;
  const loanMonths = p.loanYears * 12;
  const emiRes = loan > 0 ? calculateEmi({ principal: loan, annualRate: p.loanRate, tenureMonths: loanMonths }) : null;
  const emi = emiRes?.emi ?? 0;

  const g = 1 + p.appreciation / 100;
  const i = p.invReturn / 1200;
  const months = Math.round(p.years * 12);
  let buyInv = 0;
  let rentInv = upfront;
  let interestPaid = 0;
  const yearly: RvbYear[] = [];

  for (let m = 1; m <= months; m++) {
    const yr = Math.floor((m - 1) / 12);
    const maintenance = (p.price * Math.pow(g, yr) * p.maintPct) / 100 / 12;
    const buyOut = (m <= loanMonths ? emi : 0) + maintenance;
    const rentOut = p.rent * Math.pow(1 + p.rentRise / 100, yr);

    buyInv *= 1 + i;
    rentInv *= 1 + i;
    if (buyOut > rentOut) rentInv += buyOut - rentOut;
    else buyInv += rentOut - buyOut;
    if (emiRes && m <= loanMonths) interestPaid += emiRes.schedule[m - 1].interest;

    if (m % 12 === 0 || m === months) {
      const y = Math.ceil(m / 12);
      const value = p.price * Math.pow(g, m / 12);
      const balance = emiRes && m < loanMonths ? emiRes.schedule[m - 1].balance : 0;
      yearly.push({ year: y, buyNet: value * (1 - p.sellCostPct / 100) - balance + buyInv, rentNet: rentInv, value, balance });
    }
  }

  const last = yearly[yearly.length - 1];
  let lastBehind = -1;
  yearly.forEach((y, k) => { if (y.buyNet < y.rentNet) lastBehind = k; });
  const breakEven = lastBehind === -1 ? 1 : lastBehind === yearly.length - 1 ? null : yearly[lastBehind + 1].year;

  const year1Buy = emi + (p.price * p.maintPct) / 100 / 12;
  return {
    down, buyCosts, upfront, loan, emi, interestPaid, yearly, last, breakEven,
    sellCost: (last.value * p.sellCostPct) / 100,
    buyWins: last.buyNet >= last.rentNet,
    diff: Math.abs(last.buyNet - last.rentNet),
    year1: { emi, maintenance: (p.price * p.maintPct) / 100 / 12, buyTotal: year1Buy, rent: p.rent },
  };
}
