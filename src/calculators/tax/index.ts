import type { CalculatorDefinition } from '../types';
import { HraCalculator, IncomeTaxCalculator, SalaryCalculator } from './income-screens';
import { CapitalGainsCalculator, GratuityCalculator, GstCalculator, TdsCalculator } from './other-screens';

const tax = (def: Omit<CalculatorDefinition, 'category'>): CalculatorDefinition => ({ ...def, category: 'Tax & Salary' });

export const incomeTaxCalculator = tax({
  id: 'income-tax',
  title: 'Income Tax Calculator',
  description: 'Compare old and new regime for FY 2026-27',
  icon: 'receipt-outline',
  Component: IncomeTaxCalculator,
});

export const salaryCalculator = tax({
  id: 'salary',
  title: 'Salary / CTC to In-hand',
  description: 'Monthly take-home from your annual CTC',
  icon: 'wallet-outline',
  Component: SalaryCalculator,
});

export const hraCalculator = tax({
  id: 'hra',
  title: 'HRA Calculator',
  description: 'Tax-exempt house rent allowance',
  icon: 'home-outline',
  Component: HraCalculator,
});

export const tdsCalculator = tax({
  id: 'tds',
  title: 'TDS Calculator',
  description: 'Tax to deduct on common payments',
  icon: 'document-text-outline',
  Component: TdsCalculator,
});

export const gratuityCalculator = tax({
  id: 'gratuity',
  title: 'Gratuity Calculator',
  description: 'Gratuity on leaving or retiring',
  icon: 'gift-outline',
  Component: GratuityCalculator,
});

export const capitalGainsCalculator = tax({
  id: 'capital-gains',
  title: 'Capital Gains Tax Calculator',
  description: 'Tax on shares, property, gold and funds',
  icon: 'bar-chart-outline',
  Component: CapitalGainsCalculator,
});

export const gstCalculator = tax({
  id: 'gst',
  title: 'GST Calculator',
  description: 'Add or remove GST with CGST / SGST split',
  icon: 'pricetag-outline',
  Component: GstCalculator,
});
