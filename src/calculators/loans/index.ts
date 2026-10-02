import type { CalculatorDefinition } from '../types';
import { createLoanCalculator } from '../emi/EmiCalculator';

export const personalLoanCalculator: CalculatorDefinition = {
  id: 'personal-loan',
  title: 'Personal Loan Calculator',
  description: 'EMI and interest for unsecured personal loans',
  category: 'Loans',
  icon: 'person-outline',
  Component: createLoanCalculator({
    amount: { min: 10_000, max: 4_000_000, step: 5_000, initial: 500_000 },
    rate: { min: 6, max: 36, initial: 12 },
    tenureYears: { max: 7, initial: 3 },
  }),
};

export const carLoanCalculator: CalculatorDefinition = {
  id: 'car-loan',
  title: 'Car Loan Calculator',
  description: 'Plan EMI with car price and down payment',
  category: 'Loans',
  icon: 'car-outline',
  Component: createLoanCalculator({
    amount: { label: 'Car price', min: 100_000, max: 20_000_000, step: 25_000, initial: 1_000_000 },
    rate: { min: 5, max: 20, initial: 9 },
    tenureYears: { max: 8, initial: 5 },
    downPayment: { initialPercent: 20 },
  }),
};

export const bikeLoanCalculator: CalculatorDefinition = {
  id: 'bike-loan',
  title: 'Bike Loan Calculator',
  description: 'Plan EMI with bike price and down payment',
  category: 'Loans',
  icon: 'bicycle-outline',
  Component: createLoanCalculator({
    amount: { label: 'Bike price', min: 20_000, max: 3_000_000, step: 5_000, initial: 150_000 },
    rate: { min: 5, max: 30, initial: 11 },
    tenureYears: { max: 5, initial: 3 },
    downPayment: { initialPercent: 15 },
  }),
};
