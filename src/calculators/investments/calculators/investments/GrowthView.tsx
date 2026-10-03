import { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card, Hero, LegendRow } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { StackedBarChart } from '@/core/components/StackedBarChart';
import { formatCompact, formatCurrency } from '@/core/format';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import type { GrowthResult } from './engines';

const makeStyles = (c: Colors) =>
  StyleSheet.create({ notice: { color: c.muted, fontSize: 12, lineHeight: 18, marginBottom: 14, paddingHorizontal: 4 } });

export function Notice({ text }: { text: string }) {
  const s = useStyles(makeStyles);
  return <Text style={s.notice}>{text}</Text>;
}

type Props = {
  result: GrowthResult;
  totalLabel: string;
  investedLabel: string;
  gainsLabel: string;
  /** Replaces the default "total value" hero card. */
  hero?: ReactNode;
};

export function GrowthView({ result, totalLabel, investedLabel, gainsLabel, hero }: Props) {
  const { colors } = useTheme();
  return (
    <>
      {hero ?? <Hero label={totalLabel} value={formatCurrency(result.total)} />}
      <Card title="Breakup">
        <DonutChart
          segments={[{ value: result.invested, color: colors.primary }, { value: Math.max(0, result.gains), color: colors.gain }]}
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
