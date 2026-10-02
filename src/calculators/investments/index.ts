import type { CalculatorDefinition } from '../types';
import { FdCalculator, LumpsumCalculator, SipCalculator } from './screens';

export const sipCalculator: CalculatorDefinition = {
  id: 'sip',
  title: 'SIP Calculator',
  description: 'Future value of monthly mutual fund investments',
  category: 'Investments',
  icon: 'trending-up-outline',
  Component: SipCalculator,
};

export const lumpsumCalculator: CalculatorDefinition = {
  id: 'lumpsum',
  title: 'Lumpsum Calculator',
  description: 'Growth of a one-time investment',
  category: 'Investments',
  icon: 'cash-outline',
  Component: LumpsumCalculator,
};

export const fdCalculator: CalculatorDefinition = {
  id: 'fd',
  title: 'FD Calculator',
  description: 'Maturity value of a fixed deposit',
  category: 'Investments',
  icon: 'shield-checkmark-outline',
  Component: FdCalculator,
};
