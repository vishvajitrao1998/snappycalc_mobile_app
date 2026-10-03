import { useMemo, useState } from 'react';
import { Card, Hero, LegendRow, Screen, StatRow } from '@/core/components/Card';
import { SliderInput } from '@/core/components/SliderInput';
import { StackedBarChart } from '@/core/components/StackedBarChart';
import { formatCurrency } from '@/core/format';
import { useTheme } from '@/core/ThemeProvider';
import { calculateCagr, calculateRetirement, calculateSip, calculateSwp, requiredSip } from './engines';
import { GrowthView, Notice } from './GrowthView';

const round1 = (v: number) => Math.round(v * 10) / 10;

export function SwpCalculator() {
  const { colors } = useTheme();
  const [corpus, setCorpus] = useState(1_000_000);
  const [withdrawal, setWithdrawal] = useState(8_000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const r = useMemo(() => calculateSwp(corpus, withdrawal, rate, years), [corpus, withdrawal, rate, years]);

  const lasted = r.lastedMonths;
  const heroValue = lasted === null ? formatCurrency(r.finalValue) : `${Math.floor(lasted / 12)} yr ${lasted % 12} mo`;

  return (
    <Screen>
      <Card>
        <SliderInput label="Total investment" prefix="₹" value={corpus} min={10_000} max={100_000_000} step={10_000} onChange={setCorpus} />
        <SliderInput label="Withdrawal per month" prefix="₹" value={withdrawal} min={500} max={1_000_000} step={500} onChange={setWithdrawal} />
        <SliderInput label="Expected return (p.a.)" suffix="%" value={rate} min={1} max={20} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Time period" suffix=" yr" value={years} min={1} max={40} step={1} onChange={setYears} />
      </Card>
      <Hero
        label={lasted === null ? 'Final value' : 'Your corpus lasts'}
        value={heroValue}
        sub={lasted === null ? 'Your corpus lasts the full period' : 'Reduce the withdrawal to make it last longer'}
      />
      <Card title="Summary">
        <LegendRow color={colors.primary} label="Total investment" value={formatCurrency(corpus)} />
        <LegendRow color={colors.gain} label="Total withdrawal" value={formatCurrency(r.totalWithdrawn)} />
        <LegendRow color={colors.muted} label="Final value" value={formatCurrency(r.finalValue)} />
      </Card>
      <Card title="Balance and withdrawals by year">
        <StackedBarChart
          data={r.yearly.map((y) => ({ label: `Y${y.year}`, bottom: y.balance, top: y.withdrawn }))}
          bottomColor={colors.primary}
          topColor={colors.gain}
        />
        <LegendRow color={colors.primary} label="Remaining balance" value="" />
        <LegendRow color={colors.gain} label="Withdrawn so far" value="" />
      </Card>
    </Screen>
  );
}

export function CagrCalculator() {
  const { colors } = useTheme();
  const [initial, setInitial] = useState(100_000);
  const [final, setFinal] = useState(250_000);
  const [years, setYears] = useState(5);
  const r = useMemo(() => calculateCagr(initial, final, years), [initial, final, years]);

  return (
    <Screen>
      <Card>
        <SliderInput label="Initial value" prefix="₹" value={initial} min={1_000} max={50_000_000} step={1_000} onChange={setInitial} />
        <SliderInput label="Final value" prefix="₹" value={final} min={1_000} max={100_000_000} step={1_000} onChange={setFinal} />
        <SliderInput label="Duration" suffix=" yr" value={years} min={0.5} max={50} step={0.5} onChange={setYears} />
      </Card>
      <Hero label="CAGR" value={`${r.cagr.toFixed(2)}%`} sub="compounded annual growth rate" />
      <Card title="Summary">
        <StatRow label="Initial value" value={formatCurrency(initial)} />
        <StatRow label="Final value" value={formatCurrency(final)} />
        <StatRow label={r.gain >= 0 ? 'Total gain' : 'Total loss'} value={formatCurrency(Math.abs(r.gain))} />
        <StatRow label="Absolute return" value={`${r.absolute.toFixed(2)}%`} />
      </Card>
      <Card title="Value at this growth rate">
        <StackedBarChart
          data={r.yearly.map((y) => ({ label: `Y${y.year}`, bottom: y.invested, top: y.gains }))}
          bottomColor={colors.primary}
          topColor={colors.gain}
        />
      </Card>
    </Screen>
  );
}

export function SipGoalCalculator() {
  const [goal, setGoal] = useState(5_000_000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [inflation, setInflation] = useState(6);

  const futureGoal = goal * Math.pow(1 + inflation / 100, years);
  const sip = useMemo(() => requiredSip(futureGoal, rate, years), [futureGoal, rate, years]);
  const result = useMemo(() => calculateSip(sip, rate, years), [sip, rate, years]);

  return (
    <Screen>
      <Card>
        <SliderInput label="Goal amount (today's value)" prefix="₹" value={goal} min={50_000} max={100_000_000} step={50_000} onChange={setGoal} />
        <SliderInput label="Time to goal" suffix=" yr" value={years} min={1} max={40} step={1} onChange={setYears} />
        <SliderInput label="Expected return (p.a.)" suffix="%" value={rate} min={1} max={30} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Inflation (p.a.)" suffix="%" value={inflation} min={0} max={12} step={0.5} onChange={setInflation} />
      </Card>
      <GrowthView
        result={result}
        totalLabel="Goal value"
        investedLabel="Total SIP invested"
        gainsLabel="Estimated returns"
        hero={<Hero label="Monthly SIP required" value={formatCurrency(sip)} sub={`Goal after inflation: ${formatCurrency(futureGoal)}`} />}
      />
    </Screen>
  );
}

export function RetirementCalculator() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [life, setLife] = useState(85);
  const [expense, setExpense] = useState(50_000);
  const [inflation, setInflation] = useState(6);
  const [pre, setPre] = useState(12);
  const [post, setPost] = useState(7);
  const [savings, setSavings] = useState(500_000);

  const valid = retireAge > age && life > retireAge;
  const r = useMemo(
    () =>
      valid
        ? calculateRetirement({ age, retireAge, lifeExpectancy: life, monthlyExpense: expense, inflation, preReturn: pre, postReturn: post, savings })
        : null,
    [valid, age, retireAge, life, expense, inflation, pre, post, savings],
  );

  return (
    <Screen>
      <Card>
        <SliderInput label="Current age" suffix=" yr" value={age} min={18} max={70} step={1} onChange={setAge} />
        <SliderInput label="Retirement age" suffix=" yr" value={retireAge} min={40} max={75} step={1} onChange={setRetireAge} />
        <SliderInput label="Life expectancy" suffix=" yr" value={life} min={60} max={100} step={1} onChange={setLife} />
        <SliderInput label="Monthly expenses today" prefix="₹" value={expense} min={5_000} max={500_000} step={1_000} onChange={setExpense} />
        <SliderInput label="Inflation (p.a.)" suffix="%" value={inflation} min={2} max={12} step={0.5} onChange={setInflation} />
        <SliderInput label="Return before retirement" suffix="%" value={pre} min={4} max={20} step={0.1} onChange={(v) => setPre(round1(v))} />
        <SliderInput label="Return after retirement" suffix="%" value={post} min={3} max={12} step={0.1} onChange={(v) => setPost(round1(v))} />
        <SliderInput label="Current savings" prefix="₹" value={savings} min={0} max={50_000_000} step={10_000} onChange={setSavings} />
      </Card>
      {!r ? (
        <Notice text="Retirement age must be above your current age, and life expectancy above your retirement age." />
      ) : (
        <>
          <GrowthView
            result={r.result}
            totalLabel="Corpus at retirement"
            investedLabel="Savings + SIP invested"
            gainsLabel="Estimated returns"
            hero={
              <Hero
                label={r.sip > 0 ? 'Monthly SIP required' : "You're on track"}
                value={formatCurrency(r.sip)}
                sub={r.sip > 0 ? `to build a corpus of ${formatCurrency(r.corpus)}` : 'Your current savings already cover the corpus'}
              />
            }
          />
          <Card title="Retirement plan">
            <StatRow label="Years to retirement" value={`${r.yearsToRet}`} />
            <StatRow label="Years in retirement" value={`${r.yearsInRet}`} />
            <StatRow label="Monthly expense at retirement" value={formatCurrency(r.expenseAtRetirement)} />
            <StatRow label="Corpus needed" value={formatCurrency(r.corpus)} />
            <StatRow label="Current savings will grow to" value={formatCurrency(r.savingsFv)} />
            <StatRow label="Shortfall to cover with SIP" value={formatCurrency(r.shortfall)} />
          </Card>
          <Notice text="Estimates assume expenses rise with inflation every year and your corpus earns the post-retirement return while you withdraw. Treat this as a planning guide, not advice." />
        </>
      )}
    </Screen>
  );
}
