import type { CalculatorDefinition } from '../types';
import { AgeCalculator } from './AgeCalculator';

export const ageCalculator: CalculatorDefinition = {
  id: 'age',
  title: 'Age Calculator',
  description: 'Exact age in years, months and days',
  category: 'Utilities',
  icon: 'calendar-outline',
  Component: AgeCalculator,
};
