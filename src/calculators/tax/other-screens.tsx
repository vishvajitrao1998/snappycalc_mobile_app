import { useMemo, useState } from 'react';
import { Card, Hero, LegendRow, Screen, StatRow } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { Notice } from '@/core/components/Notice';
import { OptionList } from '@/core/components/OptionList';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import { StackedBarChart } from '@/core/components/StackedBarChart';
import { formatCompact, formatCurrency } from '@/core/format';
import { useTheme } from '@/core/ThemeProvider';
import { CgAsset, calculateCapitalGains, calculateGratuity, calculateGst, calculateTds, GRATUITY_CAP, TDS_RULES } from './engines';

export function TdsCalculator() {
  const [ruleId, setRuleId] = useState('prof');
  const [amount, setAmount] = useState(100_000);
  const [pan, setPan] = useState<'yes' | 'no'>('yes');
  const [senior, setSenior] = useState<'no' | 'yes'>('no');
  const rule = TDS_RULES.find((r) => r.id === ruleId) ?? TDS_RULES[0];
  const r = useMemo(() => calculateTds(rule, amount, pan === 'yes', senior === 'yes'), [rule, amount, pan, senior]);

  return (
    <Screen>
      <Card title="Type of payment">
        <OptionList
          options={TDS_RULES.map((t) => ({ value: t.id, label: t.label, hint: `Section ${t.section} · ${t.rate}%` }))}
          value={ruleId}
          onChange={setRuleId}
        />
      </Card>
      <Card>
        <SliderInput label={`Payment amount (${rule.period.split(' (')[0]})`} prefix="₹" value={amount} min={1_000} max={100_000_000} step={1_000} onChange={setAmount} />
        <Segmented fill options={[{ value: 'yes', label: 'PAN provided' }, { value: 'no', label: 'No PAN' }]} value={pan} onChange={setPan} />
        {rule.seniorThreshold ? (
          <>
            <Notice text=" " />
            <Segmented fill options={[{ value: 'no', label: 'Below 60' }, { value: 'yes', label: 'Senior citizen' }]} value={senior} onChange={setSenior} />
          </>
        ) : null}
      </Card>

      <Hero
        label={r.applicable ? 'TDS to deduct' : 'No TDS applies'}
        value={formatCurrency(r.tds)}
        sub={r.applicable ? `${r.rate}% under section ${rule.section}` : `Payment is within the ${formatCurrency(r.threshold)} threshold`}
      />
      <Card title="Details">
        <StatRow label="Section (earlier numbering)" value={rule.section} />
        <StatRow label="Rate applied" value={`${r.rate}%`} />
        <StatRow label="Threshold" value={`${formatCurrency(r.threshold)} ${rule.period}`} />
        <StatRow label="Payment amount" value={formatCurrency(amount)} />
        <StatRow label="TDS" value={formatCurrency(r.tds)} />
        <StatRow label="Net payable to payee" value={formatCurrency(r.net)} />
      </Card>
      <Notice text="Rates are for payments to residents in FY 2026-27. Under the Income-tax Act, 2025 most of these sit in Section 393, but rates and thresholds are unchanged apart from recent revisions. Without PAN the rate is the higher of the normal rate and 20% (5% for purchase of goods). The threshold is compared with the amount you enter for the period shown." />
    </Screen>
  );
}

export function GratuityCalculator() {
  const { colors } = useTheme();
  const [wages, setWages] = useState(50_000);
  const [ctc, setCtc] = useState(0);
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(0);
  const [kind, setKind] = useState<'regular' | 'fixed'>('regular');
  const r = useMemo(() => calculateGratuity({ wages, monthlyCtc: ctc, years, months, fixedTerm: kind === 'fixed' }), [wages, ctc, years, months, kind]);

  const bars = Array.from({ length: Math.min(r.serviceYears, 40) }, (_, i) => ({
    label: `Y${i + 1}`, bottom: Math.min(r.perYear * (i + 1), GRATUITY_CAP), top: 0,
  }));

  return (
    <Screen>
      <Card>
        <SliderInput label="Last drawn basic + DA (monthly)" prefix="₹" value={wages} min={5_000} max={1_000_000} step={1_000} onChange={setWages} />
        <SliderInput label="Monthly CTC (optional, 50% wage rule)" prefix="₹" value={ctc} min={0} max={2_000_000} step={5_000} onChange={setCtc} />
        <SliderInput label="Years of service" suffix=" yr" value={years} min={0} max={50} step={1} onChange={setYears} />
        <SliderInput label="Extra months" suffix=" mo" value={months} min={0} max={11} step={1} onChange={setMonths} />
        <Segmented fill options={[{ value: 'regular', label: 'Regular employee' }, { value: 'fixed', label: 'Fixed-term' }]} value={kind} onChange={setKind} />
      </Card>

      <Hero
        label={r.eligible ? 'Gratuity payable' : 'Not yet eligible'}
        value={formatCurrency(r.payable)}
        sub={r.eligible ? `For ${r.serviceYears} years of service` : `You need ${r.minYears} year(s) of continuous service. Amount shown is what you would get once eligible.`}
      />
      <Card title="Calculation">
        <StatRow label="Wages used (monthly)" value={formatCurrency(r.wages)} />
        <StatRow label="Service counted" value={`${r.serviceYears} years`} />
        <StatRow label="Gratuity per year of service" value={formatCurrency(r.perYear)} />
        <StatRow label="Gratuity by formula" value={formatCurrency(r.formula)} />
        {r.aboveCap > 0 && <StatRow label={`Above ${formatCurrency(GRATUITY_CAP)} limit`} value={formatCurrency(r.aboveCap)} />}
        <StatRow label="Payable under the Act (tax-free)" value={formatCurrency(r.payable)} />
      </Card>
      <Card title="Gratuity by years of service">
        <StackedBarChart data={bars} bottomColor={colors.primary} topColor={colors.gain} />
      </Card>
      <Notice text="Formula: last drawn wages × 15 ÷ 26 × completed years (service of more than 6 months in the last year counts as a full year). Under the new labour codes, wages must be at least 50% of total remuneration, which is why the optional CTC field exists. The ₹20 lakh tax-free limit is a lifetime limit across employers. Government employees follow different rules and are fully exempt." />
    </Screen>
  );
}

const SLABS = ['0', '5', '10', '15', '20', '25', '30'] as const;

export function CapitalGainsCalculator() {
  const { colors } = useTheme();
  const [asset, setAsset] = useState<CgAsset>('equity');
  const [buy, setBuy] = useState(500_000);
  const [sell, setSell] = useState(800_000);
  const [expenses, setExpenses] = useState(0);
  const [months, setMonths] = useState(18);
  const [slab, setSlab] = useState<(typeof SLABS)[number]>('30');
  const [otherLtcg, setOtherLtcg] = useState(0);

  const r = useMemo(
    () => calculateCapitalGains({ asset, buy, sell, expenses, months, slabRate: Number(slab), otherEquityLtcg: otherLtcg }),
    [asset, buy, sell, expenses, months, slab, otherLtcg],
  );

  return (
    <Screen>
      <Card title="Asset sold">
        <OptionList
          options={[
            { value: 'equity', label: 'Listed shares / equity mutual funds', hint: 'Long-term after 12 months' },
            { value: 'property', label: 'Property (land, building)', hint: 'Long-term after 24 months' },
            { value: 'other', label: 'Gold, unlisted shares, other', hint: 'Long-term after 24 months' },
            { value: 'debt', label: 'Debt mutual funds (bought after Apr 2023)', hint: 'Always taxed at your slab rate' },
          ]}
          value={asset}
          onChange={setAsset}
        />
      </Card>
      <Card>
        <SliderInput label="Purchase cost" prefix="₹" value={buy} min={0} max={500_000_000} step={10_000} onChange={setBuy} />
        <SliderInput label="Sale value" prefix="₹" value={sell} min={0} max={500_000_000} step={10_000} onChange={setSell} />
        <SliderInput label="Expenses (brokerage, transfer)" prefix="₹" value={expenses} min={0} max={10_000_000} step={1_000} onChange={setExpenses} />
        <SliderInput label="Holding period" suffix=" mo" value={months} min={0} max={240} step={1} onChange={setMonths} />
        {asset === 'equity' && (
          <SliderInput label="Other equity LTCG this year" prefix="₹" value={otherLtcg} min={0} max={1_000_000} step={5_000} onChange={setOtherLtcg} />
        )}
        {(r.slabBased) && (
          <>
            <Notice text="Your income tax slab rate" />
            <Segmented fill options={SLABS.map((v) => ({ value: v, label: `${v}%` }))} value={slab} onChange={setSlab} />
          </>
        )}
      </Card>

      <Hero
        label={r.gain >= 0 ? 'Capital gains tax' : 'No tax: this is a loss'}
        value={formatCurrency(r.totalTax)}
        sub={`${r.longTerm ? 'Long-term' : 'Short-term'} ${r.gain >= 0 ? 'gain' : 'loss'} of ${formatCurrency(Math.abs(r.gain))}`}
      />
      {r.gain > 0 && (
        <Card title="Breakup">
          <DonutChart
            segments={[{ value: Math.max(0, r.postTax), color: colors.primary }, { value: r.totalTax, color: colors.interest }]}
            centerTop="Profit after tax"
            centerBottom={formatCompact(r.postTax)}
          />
          <LegendRow color={colors.primary} label="Profit after tax" value={formatCurrency(r.postTax)} />
          <LegendRow color={colors.interest} label="Tax with cess" value={formatCurrency(r.totalTax)} />
        </Card>
      )}
      <Card title="Details">
        <StatRow label="Gain / loss" value={formatCurrency(r.gain)} />
        <StatRow label="Type" value={r.longTerm ? 'Long-term' : 'Short-term'} />
        <StatRow label="Tax rate" value={`${r.rate}%${r.slabBased ? ' (slab rate)' : ''}`} />
        {r.exemption > 0 && <StatRow label="Exempt (₹1.25 lakh limit)" value={formatCurrency(r.exemption)} />}
        <StatRow label="Taxable gain" value={formatCurrency(r.taxableGain)} />
        <StatRow label="Tax" value={formatCurrency(r.tax)} />
        <StatRow label="Cess (4%)" value={formatCurrency(r.cess)} />
      </Card>
      <Notice text="Rates for FY 2026-27: equity 20% short-term and 12.5% long-term above ₹1.25 lakh a year; other long-term assets 12.5% without indexation. Property bought before 23 July 2024 can instead use 20% with indexation if that is lower, which this calculator does not compute. Surcharge, exemptions like sections 54 and 54EC, and loss set-off are not included." />
    </Screen>
  );
}

const GST_CHIPS = ['0.25', '3', '5', '18', '40'] as const;

export function GstCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState(10_000);
  const [rate, setRate] = useState(18);
  const [kind, setKind] = useState<'intra' | 'inter'>('intra');
  const r = useMemo(() => calculateGst(amount, rate, mode), [amount, rate, mode]);

  return (
    <Screen>
      <Card>
        <Segmented fill options={[{ value: 'add', label: 'Add GST' }, { value: 'remove', label: 'Remove GST' }]} value={mode} onChange={setMode} />
        <Notice text=" " />
        <SliderInput label={mode === 'add' ? 'Amount (excluding GST)' : 'Amount (including GST)'} prefix="₹" value={amount} min={100} max={10_000_000} step={100} onChange={setAmount} />
        <Notice text="GST rate" />
        <Segmented
          fill
          options={GST_CHIPS.map((v) => ({ value: v, label: `${v}%` }))}
          value={String(rate) as (typeof GST_CHIPS)[number]}
          onChange={(v) => setRate(Number(v))}
        />
        <Notice text=" " />
        <SliderInput label="Custom rate" suffix="%" value={rate} min={0} max={40} step={0.25} onChange={setRate} />
        <Segmented fill options={[{ value: 'intra', label: 'Same state (CGST + SGST)' }, { value: 'inter', label: 'Other state (IGST)' }]} value={kind} onChange={setKind} />
      </Card>

      <Hero label="GST amount" value={formatCurrency(r.gst)} sub={`Total ${formatCurrency(r.total)}`} />
      <Card title="Breakup">
        <DonutChart
          segments={[{ value: r.base, color: colors.primary }, { value: r.gst, color: colors.interest }]}
          centerTop="Total"
          centerBottom={formatCompact(r.total)}
        />
        <LegendRow color={colors.primary} label="Amount without GST" value={formatCurrency(r.base)} />
        <LegendRow color={colors.interest} label={`GST at ${rate}%`} value={formatCurrency(r.gst)} />
        {kind === 'intra' ? (
          <>
            <StatRow label={`CGST (${rate / 2}%)`} value={formatCurrency(r.gst / 2)} />
            <StatRow label={`SGST (${rate / 2}%)`} value={formatCurrency(r.gst / 2)} />
          </>
        ) : (
          <StatRow label={`IGST (${rate}%)`} value={formatCurrency(r.gst)} />
        )}
        <StatRow label="Total amount" value={formatCurrency(r.total)} />
      </Card>
      <Notice text="Main GST rates since 22 September 2025 are 0%, 5%, 18% and 40%, with special rates of 3% on gold and silver and 0.25% on rough diamonds. Check the rate for your specific item or service." />
    </Screen>
  );
}
