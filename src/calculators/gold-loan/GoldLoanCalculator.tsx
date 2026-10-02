import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card, Hero, LegendRow, Screen, StatRow } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import { formatCompact, formatCurrency } from '@/core/format';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import { calculateEmi } from '../emi/engine';

type Purity = '24' | '22' | '18';
type Mode = 'bullet' | 'emi';

const makeStyles = (c: Colors) => StyleSheet.create({ note: { color: c.muted, fontSize: 12, marginTop: 4 } });

export function GoldLoanCalculator() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [weight, setWeight] = useState(50);
  const [rate24, setRate24] = useState(10_000); // edit to the day's rate
  const [purity, setPurity] = useState<Purity>('22');
  const [ltv, setLtv] = useState(75);
  const [interest, setInterest] = useState(12);
  const [months, setMonths] = useState(12);
  const [mode, setMode] = useState<Mode>('bullet');

  const r = useMemo(() => {
    const goldValue = weight * rate24 * (Number(purity) / 24);
    const loan = Math.round((goldValue * ltv) / 100);
    if (mode === 'emi') {
      const e = calculateEmi({ principal: loan, annualRate: interest, tenureMonths: months });
      return { goldValue, loan, monthly: e.emi, totalInterest: e.totalInterest, total: e.totalPayment };
    }
    const monthly = (loan * interest) / 1200;
    return { goldValue, loan, monthly, totalInterest: monthly * months, total: loan + monthly * months };
  }, [weight, rate24, purity, ltv, interest, months, mode]);

  return (
    <Screen>
      <Card title="Your gold">
        <SliderInput label="Gold weight" suffix=" g" value={weight} min={1} max={1000} step={1} onChange={setWeight} />
        <SliderInput label="24K gold rate (per gram)" prefix="₹" value={rate24} min={1000} max={25000} step={50} onChange={setRate24} />
        <Text style={s.note}>Enter today's rate from your lender or jeweller; the default is only a placeholder.</Text>
        <Text style={[s.note, { marginTop: 14, marginBottom: 8 }]}>Purity</Text>
        <Segmented
          fill
          options={[{ value: '24', label: '24K' }, { value: '22', label: '22K' }, { value: '18', label: '18K' }]}
          value={purity}
          onChange={setPurity}
        />
      </Card>

      <Card title="Loan terms">
        <SliderInput label="Loan-to-value (LTV)" suffix="%" value={ltv} min={30} max={85} step={1} onChange={setLtv} />
        <SliderInput label="Interest rate (p.a.)" suffix="%" value={interest} min={5} max={30} step={0.1} onChange={(v) => setInterest(Math.round(v * 10) / 10)} />
        <SliderInput label="Tenure" suffix=" mo" value={months} min={1} max={36} step={1} onChange={setMonths} />
        <Text style={[s.note, { marginBottom: 8 }]}>Repayment type</Text>
        <Segmented
          fill
          options={[{ value: 'bullet', label: 'Monthly interest' }, { value: 'emi', label: 'EMI' }]}
          value={mode}
          onChange={setMode}
        />
      </Card>

      <Hero label="Eligible loan amount" value={formatCurrency(r.loan)} sub={`Gold value ${formatCurrency(r.goldValue)}`} />

      <Card title="Repayment">
        <DonutChart
          segments={[{ value: r.loan, color: colors.primary }, { value: r.totalInterest, color: colors.interest }]}
          centerTop="Total repayment"
          centerBottom={formatCompact(r.total)}
        />
        <LegendRow color={colors.primary} label="Loan amount" value={formatCurrency(r.loan)} />
        <LegendRow color={colors.interest} label="Total interest" value={formatCurrency(r.totalInterest)} />
        <StatRow label={mode === 'emi' ? 'Monthly EMI' : 'Monthly interest'} value={formatCurrency(r.monthly)} />
        <StatRow label="Total repayment" value={formatCurrency(r.total)} />
        {mode === 'bullet' && <Text style={s.note}>Interest is paid monthly and the principal is repaid at the end of the tenure.</Text>}
      </Card>
    </Screen>
  );
}
