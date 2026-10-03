import { useState } from 'react';
import { Card, Hero, Screen, StatRow } from '@/core/components/Card';
import { NumberInput } from '@/core/components/NumberInput';
import { Notice } from '@/core/components/Notice';
import { OptionList } from '@/core/components/OptionList';
import { fmtNumber } from './engines';

type Mode = 'of' | 'is' | 'change' | 'plus' | 'minus' | 'whole';

type Config = {
  title: string;
  a: { label: string; suffix?: string };
  b: { label: string; suffix?: string };
  run: (x: number, y: number) => { label: string; value: string; steps: [string, string][] } | null;
};

const n = (v: number) => fmtNumber(v, 4);

const MODES: Record<Mode, Config> = {
  of: {
    title: 'What is X% of Y?',
    a: { label: 'Percentage', suffix: '%' },
    b: { label: 'Of this value' },
    run: (x, y) => ({ label: `${n(x)}% of ${n(y)} is`, value: n((x / 100) * y), steps: [[`${n(x)} ÷ 100`, n(x / 100)], [`× ${n(y)}`, n((x / 100) * y)]] }),
  },
  is: {
    title: 'X is what % of Y?',
    a: { label: 'Value (X)' },
    b: { label: 'Total (Y)' },
    run: (x, y) => (y === 0 ? null : { label: `${n(x)} is what % of ${n(y)}`, value: `${n((x / y) * 100)}%`, steps: [[`${n(x)} ÷ ${n(y)}`, n(x / y)], ['× 100', `${n((x / y) * 100)}%`]] }),
  },
  change: {
    title: '% change from X to Y',
    a: { label: 'From (old value)' },
    b: { label: 'To (new value)' },
    run: (x, y) => {
      if (x === 0) return null;
      const c = ((y - x) / Math.abs(x)) * 100;
      return { label: c >= 0 ? 'Increase of' : 'Decrease of', value: `${n(Math.abs(c))}%`, steps: [[`${n(y)} − ${n(x)}`, n(y - x)], [`÷ ${n(Math.abs(x))} × 100`, `${n(c)}%`]] };
    },
  },
  plus: {
    title: 'Increase Y by X%',
    a: { label: 'Increase by', suffix: '%' },
    b: { label: 'Value' },
    run: (x, y) => ({ label: `${n(y)} increased by ${n(x)}%`, value: n(y * (1 + x / 100)), steps: [[`${n(x)}% of ${n(y)}`, n((y * x) / 100)], [`${n(y)} + ${n((y * x) / 100)}`, n(y * (1 + x / 100))]] }),
  },
  minus: {
    title: 'Decrease Y by X%',
    a: { label: 'Decrease by', suffix: '%' },
    b: { label: 'Value' },
    run: (x, y) => ({ label: `${n(y)} decreased by ${n(x)}%`, value: n(y * (1 - x / 100)), steps: [[`${n(x)}% of ${n(y)}`, n((y * x) / 100)], [`${n(y)} − ${n((y * x) / 100)}`, n(y * (1 - x / 100))]] }),
  },
  whole: {
    title: 'X is Y% of what?',
    a: { label: 'Value (X)' },
    b: { label: 'Is this percentage (Y)', suffix: '%' },
    run: (x, y) => (y === 0 ? null : { label: `${n(x)} is ${n(y)}% of`, value: n((x * 100) / y), steps: [[`${n(x)} × 100`, n(x * 100)], [`÷ ${n(y)}`, n((x * 100) / y)]] }),
  },
};

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('of');
  const [x, setX] = useState('15');
  const [y, setY] = useState('2000');
  const cfg = MODES[mode];
  const nx = parseFloat(x);
  const ny = parseFloat(y);
  const result = Number.isFinite(nx) && Number.isFinite(ny) ? cfg.run(nx, ny) : null;

  return (
    <Screen>
      <Card title="What do you want to find?">
        <OptionList options={(Object.keys(MODES) as Mode[]).map((m) => ({ value: m, label: MODES[m].title }))} value={mode} onChange={setMode} />
      </Card>
      <Card>
        <NumberInput label={cfg.a.label} suffix={cfg.a.suffix} value={x} onChange={setX} />
        <NumberInput label={cfg.b.label} suffix={cfg.b.suffix} value={y} onChange={setY} />
      </Card>
      {result ? (
        <>
          <Hero label={result.label} value={result.value} />
          <Card title="Working">
            {result.steps.map(([a, b]) => (
              <StatRow key={a} label={a} value={b} />
            ))}
          </Card>
        </>
      ) : (
        <Notice text="Enter valid numbers. The second number cannot be zero for this calculation." />
      )}
    </Screen>
  );
}
