import { Card, Hero, LegendRow } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { StackedBarChart } from '@/core/components/StackedBarChart';
import { formatCompact, formatCurrency } from '@/core/format';
import { useTheme } from '@/core/ThemeProvider';
import type { GrowthResult } from './engines';

type Props = { result: GrowthResult; totalLabel: string; investedLabel: string; gainsLabel: string };

export function GrowthView({ result, totalLabel, investedLabel, gainsLabel }: Props) {
  const { colors } = useTheme();
  return (
    <>
      <Hero label={totalLabel} value={formatCurrency(result.total)} />
      <Card title="Breakup">
        <DonutChart
          segments={[{ value: result.invested, color: colors.primary }, { value: result.gains, color: colors.gain }]}
          centerTop="Total value"
          centerBottom={formatCompact(result.total)}
        />
        <LegendRow color={colors.primary} label={investedLabel} value={formatCurrency(result.invested)} />
        <LegendRow color={colors.gain} label={gainsLabel} value={formatCurrency(result.gains)} />
        <LegendRow color={colors.muted} label={totalLabel} value={formatCurrency(result.total)} />
      </Card>
      <Card title="Growth over time">
        <StackedBarChart
          data={result.yearly.map((y) => ({ label: `Y${y.year}`, bottom: y.invested, top: y.gains }))}
          bottomColor={colors.primary}
          topColor={colors.gain}
        />
      </Card>
    </>
  );
}
