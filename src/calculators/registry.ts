import { ageCalculator } from './age';
import { emiCalculator } from './emi';
import { goldLoanCalculator } from './gold-loan';
import { fdCalculator, lumpsumCalculator, sipCalculator } from './investments';
import { bikeLoanCalculator, carLoanCalculator, personalLoanCalculator } from './loans';
import type { CalculatorCategory, CalculatorDefinition } from './types';

/**
 * To add a calculator: build it in src/calculators/<name>/, export a CalculatorDefinition
 * from its index.ts, and add it to this array. Nothing else changes.
 */
export const calculators: CalculatorDefinition[] = [
  emiCalculator,
  personalLoanCalculator,
  carLoanCalculator,
  bikeLoanCalculator,
  goldLoanCalculator,
  sipCalculator,
  lumpsumCalculator,
  fdCalculator,
  ageCalculator,
];

export const getCalculator = (id?: string) => calculators.find((c) => c.id === id);

export const groupedCalculators = () => {
  const map = new Map<CalculatorCategory, CalculatorDefinition[]>();
  calculators.forEach((c) => map.set(c.category, [...(map.get(c.category) ?? []), c]));
  return [...map].map(([title, data]) => ({ title, data }));
};
