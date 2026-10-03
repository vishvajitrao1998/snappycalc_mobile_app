import { useMemo, useState } from 'react';
import { Card, Hero, LegendRow, Screen, StatRow } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { Notice } from '@/core/components/Notice';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import { formatCompact, formatCurrency } from '@/core/format';
import { useTheme } from '@/core/ThemeProvider';
import { AgeGroup, calculateHra, calculateIncomeTax, calculateSalary, RegimeResult } from './engines';

const pct = (v: number) => `${v.toFixed(2)}%`;

function RegimeCard({ title, r }: { title: string; r: RegimeResult }) {
  return (
    <Card title={title}>
      <StatRow label="Taxable income" value={formatCurrency(r.taxableIncome)} />
      <StatRow label="Tax on slabs" value={formatCurrency(r.slabTax)} />
      <StatRow label="Rebate (87A)" value={`− ${formatCurrency(r.rebate)}`} />
      <StatRow label="Surcharge" value={formatCurrency(r.surcharge)} />
      <StatRow label="Health & education cess (4%)" value={formatCurrency(r.cess)} />
      <StatRow label="Total tax" value={formatCurrency(r.totalTax)} />
      <StatRow label="Effective rate" value={pct(r.effectiveRate)} />
    </Card>
  );
}

export function IncomeTaxCalculator() {
  const { colors } = useTheme();
  const [gross, setGross] = useState(1_500_000);
  const [other, setOther] = useState(0);
  const [salaried, setSalaried] = useState<'yes' | 'no'>('yes');
  const [age, setAge] = useState<AgeGroup>('below60');
  const [employerNps, setEmployerNps] = useState(0);
  const [d80c, setD80c] = useState(150_000);
  const [d80d, setD80d] = useState(25_000);
  const [hraEx, setHraEx] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [nps1b, setNps1b] = useState(0);
  const [otherDed, setOtherDed] = useState(0);

  const r = useMemo(
    () => calculateIncomeTax({
      gross, otherIncome: other, salaried: salaried === 'yes', age, employerNps, d80c, d80d,
      hraExemption: hraEx, homeLoanInterest: homeLoan, nps1b, otherDeductions: otherDed,
    }),
    [gross, other, salaried, age, employerNps, d80c, d80d, hraEx, homeLoan, nps1b, otherDed],
  );
  const best = r.better === 'new' ? r.new : r.old;

  return (
    <Screen>
      <Card title="Income">
        <SliderInput label="Annual gross income" prefix="₹" value={gross} min={0} max={50_000_000} step={10_000} onChange={setGross} />
        <SliderInput label="Other income (interest, etc.)" prefix="₹" value={other} min={0} max={10_000_000} step={5_000} onChange={setOther} />
        <Segmented fill options={[{ value: 'yes', label: 'Salaried' }, { value: 'no', label: 'Business / other' }]} value={salaried} onChange={setSalaried} />
        <Notice text=" " />
        <Segmented fill options={[{ value: 'below60', label: 'Below 60' }, { value: '60to79', label: '60 to 79' }, { value: '80plus', label: '80+' }]} value={age} onChange={setAge} />
      </Card>

      <Card title="Deductions (old regime)">
        <SliderInput label="80C: PPF, ELSS, EPF, LIC" prefix="₹" value={d80c} min={0} max={150_000} step={1_000} onChange={setD80c} />
        <SliderInput label="80D: health insurance" prefix="₹" value={d80d} min={0} max={100_000} step={1_000} onChange={setD80d} />
        <SliderInput label="HRA exemption" prefix="₹" value={hraEx} min={0} max={1_000_000} step={1_000} onChange={setHraEx} />
        <SliderInput label="Home loan interest" prefix="₹" value={homeLoan} min={0} max={200_000} step={1_000} onChange={setHomeLoan} />
        <SliderInput label="NPS (80CCD 1B)" prefix="₹" value={nps1b} min={0} max={50_000} step={1_000} onChange={setNps1b} />
        <SliderInput label="Other deductions" prefix="₹" value={otherDed} min={0} max={500_000} step={1_000} onChange={setOtherDed} />
      </Card>

      <Card title="Both regimes">
        <SliderInput label="Employer NPS contribution" prefix="₹" value={employerNps} min={0} max={1_000_000} step={1_000} onChange={setEmployerNps} />
      </Card>

      <Hero
        label={`${r.better === 'new' ? 'New' : 'Old'} regime is better for you`}
        value={formatCurrency(best.totalTax)}
        sub={r.saving > 0 ? `You save ${formatCurrency(r.saving)} compared with the other regime` : 'Both regimes give the same tax'}
      />

      <Card title="Where your income goes">
        <DonutChart
          segments={[{ value: Math.max(0, r.total - best.totalTax), color: colors.primary }, { value: best.totalTax, color: colors.interest }]}
          centerTop="After tax"
          centerBottom={formatCompact(Math.max(0, r.total - best.totalTax))}
        />
        <LegendRow color={colors.primary} label="Income after tax" value={formatCurrency(Math.max(0, r.total - best.totalTax))} />
        <LegendRow color={colors.interest} label="Total tax" value={formatCurrency(best.totalTax)} />
        <StatRow label="Tax per month" value={formatCurrency(best.totalTax / 12)} />
      </Card>

      <RegimeCard title="New regime" r={r.new} />
      <RegimeCard title="Old regime" r={r.old} />
      <Notice text="Based on FY 2026-27 slabs: new regime ₹75,000 standard deduction and ₹60,000 rebate up to ₹12 lakh taxable income (with marginal relief); old regime ₹50,000 standard deduction. Assumes all income is taxed at slab rates, so capital gains at special rates are not covered. Verify with a tax professional before filing." />
    </Screen>
  );
}

export function SalaryCalculator() {
  const { colors } = useTheme();
  const [ctc, setCtc] = useState(1_200_000);
  const [basicPct, setBasicPct] = useState(50);
  const [hraPct, setHraPct] = useState(40);
  const [variable, setVariable] = useState(0);
  const [pf, setPf] = useState<'full' | 'capped'>('full');
  const [grat, setGrat] = useState<'yes' | 'no'>('yes');
  const [pt, setPt] = useState(2_400);

  const s = useMemo(
    () => calculateSalary({ ctc, basicPct, hraPctOfBasic: hraPct, variable, pfCapped: pf === 'capped', gratuityInCtc: grat === 'yes', professionalTax: pt }),
    [ctc, basicPct, hraPct, variable, pf, grat, pt],
  );
  const m = (v: number) => formatCurrency(v / 12);

  return (
    <Screen>
      <Card>
        <SliderInput label="Annual CTC" prefix="₹" value={ctc} min={200_000} max={50_000_000} step={10_000} onChange={setCtc} />
        <SliderInput label="Basic (% of CTC)" suffix="%" value={basicPct} min={30} max={70} step={1} onChange={setBasicPct} />
        <SliderInput label="HRA (% of basic)" suffix="%" value={hraPct} min={0} max={60} step={1} onChange={setHraPct} />
        <SliderInput label="Variable pay (yearly, in CTC)" prefix="₹" value={variable} min={0} max={10_000_000} step={5_000} onChange={setVariable} />
        <SliderInput label="Professional tax (yearly)" prefix="₹" value={pt} min={0} max={2_500} step={100} onChange={setPt} />
        <Notice text="PF calculated on" />
        <Segmented fill options={[{ value: 'full', label: '12% of basic' }, { value: 'capped', label: 'Capped at ₹15,000 wage' }]} value={pf} onChange={setPf} />
        <Notice text=" " />
        <Notice text="Gratuity included in CTC" />
        <Segmented fill options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} value={grat} onChange={setGrat} />
      </Card>

      <Hero label="Monthly in-hand salary" value={formatCurrency(s.net / 12)} sub={`${formatCurrency(s.net)} a year after tax and deductions`} />

      {s.overflow && <Notice text="Basic, HRA, PF and gratuity add up to more than your CTC, so the special allowance is shown as zero. Reduce the basic % or HRA %." />}

      <Card title="Monthly breakup">
        <StatRow label="Basic" value={m(s.basic)} />
        <StatRow label="HRA" value={m(s.hra)} />
        <StatRow label="Special allowance" value={m(s.special)} />
        {s.variable > 0 && <StatRow label="Variable pay (average)" value={m(s.variable)} />}
        <StatRow label="Gross salary" value={m(s.gross)} />
        <StatRow label="Employee PF" value={`− ${m(s.employeePf)}`} />
        <StatRow label="Professional tax" value={`− ${m(pt)}`} />
        <StatRow label="Income tax (estimated TDS)" value={`− ${m(s.tax)}`} />
        <StatRow label="In-hand salary" value={m(s.net)} />
      </Card>

      <Card title="Where your CTC goes">
        <DonutChart
          segments={[
            { value: s.net, color: colors.primary },
            { value: s.tax, color: colors.interest },
            { value: s.employeePf + s.employerPf + s.gratuity, color: colors.gain },
            { value: pt, color: colors.muted },
          ]}
          centerTop="CTC"
          centerBottom={formatCompact(ctc)}
        />
        <LegendRow color={colors.primary} label="In-hand salary" value={formatCurrency(s.net)} />
        <LegendRow color={colors.interest} label="Income tax" value={formatCurrency(s.tax)} />
        <LegendRow color={colors.gain} label="PF and gratuity (both sides)" value={formatCurrency(s.employeePf + s.employerPf + s.gratuity)} />
        <LegendRow color={colors.muted} label="Professional tax" value={formatCurrency(pt)} />
      </Card>
      <Notice text="Tax uses the new regime with the ₹75,000 standard deduction. Use the Income Tax calculator to compare the old regime. Actual in-hand pay depends on your employer's structure, declarations and other deductions." />
    </Screen>
  );
}

export function HraCalculator() {
  const [basic, setBasic] = useState(40_000);
  const [da, setDa] = useState(0);
  const [hraReceived, setHraReceived] = useState(16_000);
  const [rent, setRent] = useState(15_000);
  const [city, setCity] = useState<'metro' | 'other'>('metro');
  const r = useMemo(() => calculateHra({ basic, da, hraReceived, rent, metro: city === 'metro' }), [basic, da, hraReceived, rent, city]);

  return (
    <Screen>
      <Card>
        <SliderInput label="Basic salary (monthly)" prefix="₹" value={basic} min={5_000} max={500_000} step={1_000} onChange={setBasic} />
        <SliderInput label="Dearness allowance (monthly)" prefix="₹" value={da} min={0} max={200_000} step={500} onChange={setDa} />
        <SliderInput label="HRA received (monthly)" prefix="₹" value={hraReceived} min={0} max={300_000} step={500} onChange={setHraReceived} />
        <SliderInput label="Rent paid (monthly)" prefix="₹" value={rent} min={0} max={300_000} step={500} onChange={setRent} />
        <Segmented
          fill
          options={[{ value: 'metro', label: 'Metro (50%)' }, { value: 'other', label: 'Other city (40%)' }]}
          value={city}
          onChange={setCity}
        />
      </Card>
      <Notice text="Metro for HRA means Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune or Ahmedabad (the last four were added from 1 April 2026)." />

      <Hero label="HRA exemption (yearly)" value={formatCurrency(r.exempt * 12)} sub={`${formatCurrency(r.taxable * 12)} of your HRA is taxable`} />

      <Card title="Monthly calculation (least of the three)">
        <StatRow label="1. HRA received" value={formatCurrency(r.actual)} />
        <StatRow label="2. Rent paid minus 10% of salary" value={formatCurrency(r.rentMinus)} />
        <StatRow label={`3. ${city === 'metro' ? '50%' : '40%'} of basic + DA`} value={formatCurrency(r.cityLimit)} />
        <StatRow label="Exempt HRA (monthly)" value={formatCurrency(r.exempt)} />
        <StatRow label="Taxable HRA (monthly)" value={formatCurrency(r.taxable)} />
      </Card>
      <Notice text="HRA exemption is available only under the old tax regime. If your yearly rent is above ₹1 lakh, your landlord's PAN is needed. Enter the exemption in the Income Tax calculator to compare regimes." />
    </Screen>
  );
}
