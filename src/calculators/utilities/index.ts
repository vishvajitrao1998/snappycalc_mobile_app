import type { CalculatorDefinition } from '../types';
import { BirthdayCalculator, DateDifferenceCalculator } from './date-screens';
import { BmiCalculator, BmrCalculator, CalorieCalculator } from './health-screens';
import { PercentageCalculator } from './PercentageCalculator';

export const bmiCalculator: CalculatorDefinition = {
  id: 'bmi',
  title: 'BMI Calculator',
  description: 'Body mass index with healthy weight range',
  category: 'Health',
  icon: 'body-outline',
  Component: BmiCalculator,
};

export const bmrCalculator: CalculatorDefinition = {
  id: 'bmr',
  title: 'BMR Calculator',
  description: 'Calories your body burns at rest',
  category: 'Health',
  icon: 'flame-outline',
  Component: BmrCalculator,
};

export const calorieCalculator: CalculatorDefinition = {
  id: 'calorie',
  title: 'Calorie Calculator',
  description: 'Daily calories and macros for your goal',
  category: 'Health',
  icon: 'restaurant-outline',
  Component: CalorieCalculator,
};

export const birthdayCalculator: CalculatorDefinition = {
  id: 'birthday',
  title: 'Birthday Calculator',
  description: 'Countdown, zodiac sign and age milestones',
  category: 'Utilities',
  icon: 'sparkles-outline',
  Component: BirthdayCalculator,
};

export const dateDifferenceCalculator: CalculatorDefinition = {
  id: 'date-difference',
  title: 'Date Difference Calculator',
  description: 'Days between dates, or add and subtract days',
  category: 'Utilities',
  icon: 'swap-horizontal-outline',
  Component: DateDifferenceCalculator,
};

export const percentageCalculator: CalculatorDefinition = {
  id: 'percentage',
  title: 'Percentage Calculator',
  description: 'Percent of, change, increase and decrease',
  category: 'Utilities',
  icon: 'pie-chart-outline',
  Component: PercentageCalculator,
};
