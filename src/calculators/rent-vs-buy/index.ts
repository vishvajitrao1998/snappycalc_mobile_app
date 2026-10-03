import type { CalculatorDefinition } from '../types';
import { RentVsBuyCalculator } from './RentVsBuy';

export const rentVsBuyCalculator: CalculatorDefinition = {
  id: 'rent-vs-buy',
  title: 'Rent vs Buy Calculator',
  description: 'Should you buy a home or rent and invest?',
  category: 'Loans',
  icon: 'home-outline',
  Component: RentVsBuyCalculator,
};
