import type { CalculatorDefinition } from '../types';
import { EmiCalculator } from './EmiCalculator';

export const emiCalculator: CalculatorDefinition = {
  id: 'emi',
  title: 'EMI Calculator',
  description: 'Monthly instalment, interest breakup and amortization',
  category: 'Loans',
  icon: 'calculator-outline',
  Component: EmiCalculator,
};