import type { CalculatorDefinition } from '../types';
import { GoldLoanCalculator } from './GoldLoanCalculator';

export const goldLoanCalculator: CalculatorDefinition = {
  id: 'gold-loan',
  title: 'Gold Loan Calculator',
  description: 'Eligible amount, interest and repayment on gold',
  category: 'Loans',
  icon: 'diamond-outline',
  Component: GoldLoanCalculator,
};
