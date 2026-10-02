import { useMemo, useState } from 'react';
import { Text } from 'react-native';
import { Card, Screen } from '@/core/components/Card';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import { useTheme } from '@/core/ThemeProvider';
import { calculateFd, calculateLumpsum, calculateSip } from './engines';
import { GrowthView } from './GrowthView';

const round1 = (v: number) => Math.round(v * 10) / 10;

export function SipCalculator() {
  const [monthly, setMonthly] = useState(5_000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const result = useMemo(() => calculateSip(monthly, rate, years), [monthly, rate, years]);
  return (
    <Screen>
      <Card>
        <SliderInput label="Monthly investment" prefix="₹" value={monthly} min={500} max={200_000} step={500} onChange={setMonthly} />
        <SliderInput label="Expected return (p.a.)" suffix="%" value={rate} min={1} max={30} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Time period" suffix=" yr" value={years} min={1} max={40} step={1} onChange={setYears} />
      </Card>
      <GrowthView result={result} totalLabel="Expected value" investedLabel="Invested amount" gainsLabel="Estimated returns" />
    </Screen>
  );
}

export function LumpsumCalculator() {
  const [amount, setAmount] = useState(100_000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const result = useMemo(() => calculateLumpsum(amount, rate, years), [amount, rate, years]);
  return (
    <Screen>
      <Card>
        <SliderInput label="Total investment" prefix="₹" value={amount} min={5_000} max={10_000_000} step={5_000} onChange={setAmount} />
        <SliderInput label="Expected return (p.a.)" suffix="%" value={rate} min={1} max={30} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Time period" suffix=" yr" value={years} min={1} max={40} step={1} onChange={setYears} />
      </Card>
      <GrowthView result={result} totalLabel="Expected value" investedLabel="Invested amount" gainsLabel="Estimated returns" />
    </Screen>
  );
}

type Freq = '12' | '4' | '2' | '1';

export function FdCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState(100_000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);
  const [freq, setFreq] = useState<Freq>('4');
  const result = useMemo(() => calculateFd(amount, rate, years, Number(freq)), [amount, rate, years, freq]);
  return (
    <Screen>
      <Card>
        <SliderInput label="Deposit amount" prefix="₹" value={amount} min={10_000} max={10_000_000} step={10_000} onChange={setAmount} />
        <SliderInput label="Interest rate (p.a.)" suffix="%" value={rate} min={1} max={15} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Tenure" suffix=" yr" value={years} min={0.5} max={10} step={0.5} onChange={setYears} />
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Compounding</Text>
        <Segmented
          fill
          options={[
            { value: '12', label: 'Monthly' },
            { value: '4', label: 'Quarterly' },
            { value: '2', label: 'Half-yearly' },
            { value: '1', label: 'Yearly' },
          ]}
          value={freq}
          onChange={setFreq}
        />
      </Card>
      <GrowthView result={result} totalLabel="Maturity value" investedLabel="Deposit amount" gainsLabel="Total interest" />
    </Screen>
  );
}
