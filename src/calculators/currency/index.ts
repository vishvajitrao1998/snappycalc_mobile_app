import type { CalculatorDefinition } from '../types';
import { CurrencyConverter } from './CurrencyConverter';

export const currencyConverter: CalculatorDefinition = {
  id: 'currency',
  title: 'Currency Converter',
  description: 'Live exchange rates for 160+ currencies',
  category: 'Utilities',
  icon: 'globe-outline',
  Component: CurrencyConverter,
};
