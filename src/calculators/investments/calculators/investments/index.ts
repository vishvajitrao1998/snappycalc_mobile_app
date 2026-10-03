import type { CalculatorDefinition } from '../types';
import { EpfCalculator, NpsCalculator, PpfCalculator, StepUpSipCalculator } from './growth-screens';
import { CagrCalculator, RetirementCalculator, SipGoalCalculator, SwpCalculator } from './planning-screens';
import { FdCalculator, LumpsumCalculator, SipCalculator } from './screens';

const investment = (
  def: Omit<CalculatorDefinition, 'category'>,
): CalculatorDefinition => ({ ...def, category: 'Investments' });

export const sipCalculator = investment({
  id: 'sip',
  title: 'SIP Calculator',
  description: 'Future value of monthly mutual fund investments',
  icon: 'trending-up-outline',
  Component: SipCalculator,
});

export const stepUpSipCalculator = investment({
  id: 'step-up-sip',
  title: 'Step-up SIP Calculator',
  description: 'SIP that increases every year',
  icon: 'stats-chart-outline',
  Component: StepUpSipCalculator,
});

export const sipGoalCalculator = investment({
  id: 'sip-goal',
  title: 'SIP Goal Calculator',
  description: 'Monthly SIP needed to reach a target',
  icon: 'flag-outline',
  Component: SipGoalCalculator,
});

export const lumpsumCalculator = investment({
  id: 'lumpsum',
  title: 'Lumpsum Calculator',
  description: 'Growth of a one-time investment',
  icon: 'cash-outline',
  Component: LumpsumCalculator,
});

export const swpCalculator = investment({
  id: 'swp',
  title: 'SWP Calculator',
  description: 'Regular withdrawals from your investment',
  icon: 'download-outline',
  Component: SwpCalculator,
});

export const fdCalculator = investment({
  id: 'fd',
  title: 'FD Calculator',
  description: 'Maturity value of a fixed deposit',
  icon: 'shield-checkmark-outline',
  Component: FdCalculator,
});

export const ppfCalculator = investment({
  id: 'ppf',
  title: 'PPF Calculator',
  description: 'Maturity value of Public Provident Fund',
  icon: 'library-outline',
  Component: PpfCalculator,
});

export const epfCalculator = investment({
  id: 'epf',
  title: 'EPF Calculator',
  description: 'Provident fund balance at retirement',
  icon: 'briefcase-outline',
  Component: EpfCalculator,
});

export const npsCalculator = investment({
  id: 'nps',
  title: 'NPS Calculator',
  description: 'Corpus, lump sum and monthly pension',
  icon: 'umbrella-outline',
  Component: NpsCalculator,
});

export const cagrCalculator = investment({
  id: 'cagr',
  title: 'CAGR Calculator',
  description: 'Compounded annual growth rate of an investment',
  icon: 'analytics-outline',
  Component: CagrCalculator,
});

export const retirementCalculator = investment({
  id: 'retirement',
  title: 'Retirement Calculator',
  description: 'Corpus and monthly SIP needed to retire',
  icon: 'hourglass-outline',
  Component: RetirementCalculator,
});
