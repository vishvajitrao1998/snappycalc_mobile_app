import type { ComponentType } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type CalculatorCategory = 'Loans' | 'Investments' | 'Utilities';

export type CalculatorDefinition = {
  id: string; // used in the route: /calculator/<id>
  title: string;
  description: string;
  category: CalculatorCategory;
  icon: keyof typeof Ionicons.glyphMap;
  Component: ComponentType;
};
