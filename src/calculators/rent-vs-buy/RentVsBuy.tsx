import { useMemo, useState } from 'react';
import { Card, Hero, LegendRow, Screen, StatRow } from '@/core/components/Card';
import { LineChart } from '@/core/components/LineChart';
import { Notice } from '@/core/components/Notice';
import { SliderInput } from '@/core/components/SliderInput';
import { formatCompact, formatCurrency } from '@/core/format';
import { useTheme } from '@/core/ThemeProvider';
import { calculateRentVsBuy } from './engine';

const r1 = (v: number) => Math.round(v * 10) / 10;
const compact = (v: number) => (v < 0 ? '-' : '') + formatCompact(Math.abs(v));

export function RentVsBuyCalculator() {
  const { colors } = useTheme();
  const [price, setPrice] = useState(8_000_000);
  const [downPct, setDownPct] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(20);
  const [appreciation, setAppreciation] = useState(5);
  const [buyCostPct, setBuyCostPct] = useState(7);
  const [maintPct, setMaintPct] = useState(1);
  const [rent, setRent] = useState(25_000);
  const [rentRise, setRentRise] = useState(5);
  const [invReturn, setInvReturn] = useState(10);
  const [years, setYears] = useState(15);
  const [sellCostPct, setSellCostPct] = useState(2);

  const r = useMemo(
    () => calculateRentVsBuy({ price, downPct, loanRate, loanYears, appreciation, buyCostPct, maintPct, rent, rentRise, invReturn, years, sellCostPct }),
    [price, downPct, loanRate, loanYears, appreciation, buyCostPct, maintPct, rent, rentRise, invReturn, years, sellCostPct],
  );

  return (
    <Screen>
      <Card title="Buying">
        <SliderInput label="Property price" prefix="₹" value={price} min={500_000} max={200_000_000} step={100_000} onChange={setPrice} />
        <SliderInput label="Down payment" suffix="%" value={downPct} min={5} max={90} step={1} onChange={setDownPct} />
        <SliderInput label="Home loan interest rate" suffix="%" value={loanRate} min={5} max={15} step={0.1} onChange={(v) => setLoanRate(r1(v))} />
        <SliderInput label="Loan tenure" suffix=" yr" value={loanYears} min={5} max={30} step={1} onChange={setLoanYears} />
        <SliderInput label="Property price growth (p.a.)" suffix="%" value={appreciation} min={0} max={15} step={0.5} onChange={setAppreciation} />
        <SliderInput label="Stamp duty and registration" suffix="%" value={buyCostPct} min={0} max={12} step={0.5} onChange={setBuyCostPct} />
        <SliderInput label="Maintenance and property tax (p.a.)" suffix="%" value={maintPct} min={0} max={3} step={0.1} onChange={(v) => setMaintPct(r1(v))} />
        <SliderInput label="Selling cost at the end" suffix="%" value={sellCostPct} min={0} max={5} step={0.5} onChange={setSellCostPct} />
      </Card>

      <Card title="Renting and investing">
        <SliderInput label="Monthly rent today" prefix="₹" value={rent} min={2_000} max={500_000} step={500} onChange={setRent} />
        <SliderInput label="Yearly rent increase" suffix="%" value={rentRise} min={0} max={15} step={0.5} onChange={setRentRise} />
        <SliderInput label="Return on your investments (p.a.)" suffix="%" value={invReturn} min={4} max={20} step={0.1} onChange={(v) => setInvReturn(r1(v))} />
        <SliderInput label="Compare after" suffix=" yr" value={years} min={1} max={40} step={1} onChange={setYears} />
      </Card>

      <Hero
        label={r.buyWins ? 'Buying builds more wealth by' : 'Renting builds more wealth by'}
        value={formatCurrency(r.diff)}
        sub={`After ${years} years: buying ${formatCompact(r.last.buyNet)} vs renting ${formatCompact(r.last.rentNet)}`}
      />
      <Notice
        text={
          r.breakEven === null
            ? `Buying does not overtake renting within ${years} years with these inputs.`
            : r.breakEven === 1
              ? 'Buying stays ahead of renting throughout.'
              : `Buying overtakes renting in year ${r.breakEven}.`
        }
      />

      <Card title="Net worth over time">
        <LineChart
          labels={r.yearly.map((y) => `Y${y.year}`)}
          series={[
            { name: 'Buy', color: colors.primary, values: r.yearly.map((y) => y.buyNet) },
            { name: 'Rent and invest', color: colors.gain, values: r.yearly.map((y) => y.rentNet) },
          ]}
          format={compact}
        />
      </Card>

      <Card title="Monthly cost in year 1">
        <LegendRow color={colors.primary} label="Home loan EMI" value={formatCurrency(r.year1.emi)} />
        <LegendRow color={colors.primary} label="Maintenance and property tax" value={formatCurrency(r.year1.maintenance)} />
        <StatRow label="Total cost of owning" value={formatCurrency(r.year1.buyTotal)} />
        <LegendRow color={colors.gain} label="Rent" value={formatCurrency(r.year1.rent)} />
      </Card>

      <Card title={`If you buy (after ${years} years)`}>
        <StatRow label="Down payment" value={formatCurrency(r.down)} />
        <StatRow label="Stamp duty and registration" value={formatCurrency(r.buyCosts)} />
        <StatRow label="Loan amount" value={formatCurrency(r.loan)} />
        <StatRow label="Interest paid in this period" value={formatCurrency(r.interestPaid)} />
        <StatRow label="Property value" value={formatCurrency(r.last.value)} />
        <StatRow label="Selling cost" value={`− ${formatCurrency(r.sellCost)}`} />
        <StatRow label="Loan still owed" value={`− ${formatCurrency(r.last.balance)}`} />
        <StatRow label="Net worth if you buy" value={formatCurrency(r.last.buyNet)} />
      </Card>

      <Card title={`If you rent (after ${years} years)`}>
        <StatRow label="Money invested at the start" value={formatCurrency(r.upfront)} />
        <StatRow label="Net worth if you rent" value={formatCurrency(r.last.rentNet)} />
      </Card>

      <Notice text="Both options start with the same cash and spend the same total each month: whoever pays less invests the difference, so renting only wins if you really invest that money regularly. Results are very sensitive to price growth, rent and investment returns, so try different values. Home loan tax benefits, rental income if you let the property out, and the emotional value of owning a home are not included. This is a planning guide, not financial advice." />
    </Screen>
  );
}
