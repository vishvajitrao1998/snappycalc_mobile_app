import { useMemo, useState } from 'react';
import { Card, Screen, StatRow } from '@/core/components/Card';
import { SliderInput } from '@/core/components/SliderInput';
import { formatCurrency } from '@/core/format';
import { calculateEpf, calculatePpf, calculateSip, calculateStepUpSip } from './engines';
import { GrowthView, Notice } from './GrowthView';

const round1 = (v: number) => Math.round(v * 10) / 10;
const round2 = (v: number) => Math.round(v * 100) / 100;

export function StepUpSipCalculator() {
  const [monthly, setMonthly] = useState(5_000);
  const [step, setStep] = useState(10);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const result = useMemo(() => calculateStepUpSip(monthly, step, rate, years), [monthly, step, rate, years]);
  return (
    <Screen>
      <Card>
        <SliderInput label="Starting monthly SIP" prefix="₹" value={monthly} min={500} max={200_000} step={500} onChange={setMonthly} />
        <SliderInput label="Annual step-up" suffix="%" value={step} min={0} max={50} step={1} onChange={setStep} />
        <SliderInput label="Expected return (p.a.)" suffix="%" value={rate} min={1} max={30} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Time period" suffix=" yr" value={years} min={1} max={40} step={1} onChange={setYears} />
      </Card>
      <GrowthView result={result} totalLabel="Expected value" investedLabel="Invested amount" gainsLabel="Estimated returns" />
      <Card>
        <StatRow label="Monthly SIP in final year" value={formatCurrency(monthly * Math.pow(1 + step / 100, years - 1))} />
      </Card>
    </Screen>
  );
}

export function PpfCalculator() {
  const [deposit, setDeposit] = useState(150_000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(15);
  const result = useMemo(() => calculatePpf(deposit, rate, years), [deposit, rate, years]);
  return (
    <Screen>
      <Card>
        <SliderInput label="Yearly investment" prefix="₹" value={deposit} min={500} max={150_000} step={500} onChange={setDeposit} />
        <SliderInput label="Interest rate (p.a.)" suffix="%" value={rate} min={5} max={10} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Duration" suffix=" yr" value={years} min={15} max={50} step={5} onChange={setYears} />
      </Card>
      <Notice text="PPF has a 15-year lock-in, extendable in 5-year blocks, and a yearly limit of ₹1.5 lakh. The government revises the rate every quarter, so update it to the current rate. Deposits are assumed at the start of each financial year." />
      <GrowthView result={result} totalLabel="Maturity value" investedLabel="Total investment" gainsLabel="Total interest" />
    </Screen>
  );
}

export function NpsCalculator() {
  const [monthly, setMonthly] = useState(5_000);
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [rate, setRate] = useState(10);
  const [annuityPct, setAnnuityPct] = useState(40);
  const [annuityRate, setAnnuityRate] = useState(6);

  const years = retireAge - age;
  const result = useMemo(() => (years >= 1 ? calculateSip(monthly, rate, years) : null), [monthly, rate, years]);
  const annuityAmount = result ? (result.total * annuityPct) / 100 : 0;

  return (
    <Screen>
      <Card>
        <SliderInput label="Monthly contribution" prefix="₹" value={monthly} min={500} max={200_000} step={500} onChange={setMonthly} />
        <SliderInput label="Current age" suffix=" yr" value={age} min={18} max={65} step={1} onChange={setAge} />
        <SliderInput label="Retirement age" suffix=" yr" value={retireAge} min={40} max={75} step={1} onChange={setRetireAge} />
        <SliderInput label="Expected return (p.a.)" suffix="%" value={rate} min={4} max={15} step={0.1} onChange={(v) => setRate(round1(v))} />
        <SliderInput label="Corpus used to buy annuity" suffix="%" value={annuityPct} min={40} max={100} step={1} onChange={setAnnuityPct} />
        <SliderInput label="Expected annuity rate" suffix="%" value={annuityRate} min={3} max={10} step={0.1} onChange={(v) => setAnnuityRate(round1(v))} />
      </Card>
      {!result ? (
        <Notice text="Retirement age must be higher than your current age." />
      ) : (
        <>
          <GrowthView result={result} totalLabel="Corpus at retirement" investedLabel="Total contribution" gainsLabel="Estimated returns" />
          <Card title="At retirement">
            <StatRow label="Lump sum you can withdraw" value={formatCurrency(result.total - annuityAmount)} />
            <StatRow label="Amount used for annuity" value={formatCurrency(annuityAmount)} />
            <StatRow label="Expected monthly pension" value={formatCurrency((annuityAmount * annuityRate) / 100 / 12)} />
          </Card>
          <Notice text="At least 40% of the corpus must go into an annuity. Returns and annuity rates are estimates and not guaranteed." />
        </>
      )}
    </Screen>
  );
}

export function EpfCalculator() {
  const [basic, setBasic] = useState(30_000);
  const [age, setAge] = useState(25);
  const [retireAge, setRetireAge] = useState(58);
  const [raise, setRaise] = useState(5);
  const [rate, setRate] = useState(8.25);

  const valid = retireAge > age;
  const epf = useMemo(
    () => (valid ? calculateEpf({ basic, age, retireAge, raisePct: raise, ratePct: rate }) : null),
    [valid, basic, age, retireAge, raise, rate],
  );

  return (
    <Screen>
      <Card>
        <SliderInput label="Monthly basic + DA" prefix="₹" value={basic} min={5_000} max={500_000} step={1_000} onChange={setBasic} />
        <SliderInput label="Current age" suffix=" yr" value={age} min={18} max={57} step={1} onChange={setAge} />
        <SliderInput label="Retirement age" suffix=" yr" value={retireAge} min={40} max={60} step={1} onChange={setRetireAge} />
        <SliderInput label="Yearly salary increase" suffix="%" value={raise} min={0} max={20} step={0.5} onChange={setRaise} />
        <SliderInput label="EPF interest rate (p.a.)" suffix="%" value={rate} min={5} max={12} step={0.05} onChange={(v) => setRate(round2(v))} />
      </Card>
      {!epf ? (
        <Notice text="Retirement age must be higher than your current age." />
      ) : (
        <>
          <GrowthView result={epf.result} totalLabel="EPF balance at retirement" investedLabel="Total contribution" gainsLabel="Total interest" />
          <Card title="Contribution split">
            <StatRow label="Your contribution (12%)" value={formatCurrency(epf.employee)} />
            <StatRow label="Employer's EPF share" value={formatCurrency(epf.employer)} />
            <StatRow label="Interest earned" value={formatCurrency(epf.result.gains)} />
          </Card>
          <Notice text="Assumes you and your employer each contribute 12% of basic pay, with 8.33% of wages (capped at ₹15,000) going to EPS instead of EPF. The interest rate is declared yearly by EPFO, so edit it to the latest rate." />
        </>
      )}
    </Screen>
  );
}
