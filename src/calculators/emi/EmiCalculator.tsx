import { useMemo, useState } from 'react';
import { Card, Hero, LegendRow, Screen } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import { StackedBarChart } from '@/core/components/StackedBarChart';
import { formatCompact, formatCurrency } from '@/core/format';
import { useTheme } from '@/core/ThemeProvider';
import { AmortizationTable } from './AmortizationTable';
import { calculateEmi } from './engine';

type Unit = 'years' | 'months';

export type LoanConfig = {
  amount: { label?: string; min: number; max: number; step: number; initial: number };
  rate: { min: number; max: number; initial: number };
  tenureYears: { max: number; initial: number };
  /** Set for vehicle loans: amount becomes the vehicle price and the loan = price - down payment. */
  downPayment?: { initialPercent: number };
};

export function LoanCalculator({ config }: { config: LoanConfig }) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState(config.amount.initial);
  const [dp, setDp] = useState(config.downPayment?.initialPercent ?? 0);
  const [rate, setRate] = useState(config.rate.initial);
  const [tenure, setTenure] = useState(config.tenureYears.initial);
  const [unit, setUnit] = useState<Unit>('years');

  const principal = config.downPayment ? Math.round(amount * (1 - dp / 100)) : amount;
  const tenureMonths = unit === 'years' ? tenure * 12 : tenure;
  const result = useMemo(
    () => calculateEmi({ principal, annualRate: rate, tenureMonths }),
    [principal, rate, tenureMonths],
  );

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    setTenure(u === 'months' ? tenure * 12 : Math.max(1, Math.round(tenure / 12)));
    setUnit(u);
  };

  return (
    <Screen>
      <Card>
        <SliderInput
          label={config.amount.label ?? 'Loan amount'}
          prefix="₹"
          value={amount}
          min={config.amount.min}
          max={config.amount.max}
          step={config.amount.step}
          onChange={setAmount}
        />
        {config.downPayment && (
          <SliderInput label="Down payment" suffix="%" value={dp} min={0} max={90} step={1} onChange={setDp} />
        )}
        <SliderInput
          label="Interest rate (p.a.)"
          suffix="%"
          value={rate}
          min={config.rate.min}
          max={config.rate.max}
          step={0.1}
          onChange={(v) => setRate(Math.round(v * 10) / 10)}
        />
        <SliderInput
          label="Tenure"
          suffix={unit === 'years' ? ' yr' : ' mo'}
          value={tenure}
          min={1}
          max={unit === 'years' ? config.tenureYears.max : config.tenureYears.max * 12}
          step={1}
          onChange={setTenure}
          accessory={
            <Segmented
              options={[{ value: 'years', label: 'Yr' }, { value: 'months', label: 'Mo' }]}
              value={unit}
              onChange={switchUnit}
            />
          }
        />
      </Card>

      <Hero label="Monthly EMI" value={formatCurrency(result.emi)} />

      <Card title="Payment breakup">
        <DonutChart
          segments={[
            { value: principal, color: colors.primary },
            { value: result.totalInterest, color: colors.interest },
          ]}
          centerTop="Total payable"
          centerBottom={formatCompact(result.totalPayment)}
        />
        <LegendRow color={colors.primary} label="Principal amount" value={formatCurrency(principal)} />
        <LegendRow color={colors.interest} label="Total interest" value={formatCurrency(result.totalInterest)} />
        <LegendRow color={colors.muted} label="Total payment" value={formatCurrency(result.totalPayment)} />
        {config.downPayment && (
          <LegendRow color={colors.gain} label="Down payment" value={formatCurrency(amount - principal)} />
        )}
      </Card>

      <Card title="Principal vs interest by year">
        <StackedBarChart
          data={result.yearly.map((y) => ({ label: `Y${y.year}`, bottom: y.principal, top: y.interest }))}
          bottomColor={colors.primary}
          topColor={colors.interest}
        />
      </Card>

      <Card title="Amortization schedule">
        <AmortizationTable data={result.yearly} />
      </Card>
    </Screen>
  );
}

export const createLoanCalculator = (config: LoanConfig) =>
  function ConfiguredLoanCalculator() {
    return <LoanCalculator config={config} />;
  };

export const EmiCalculator = createLoanCalculator({
  amount: { min: 10_000, max: 10_000_000, step: 10_000, initial: 1_000_000 },
  rate: { min: 1, max: 30, initial: 8.5 },
  tenureYears: { max: 30, initial: 10 },
});
