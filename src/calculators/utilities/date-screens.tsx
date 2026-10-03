import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Hero, Screen, StatRow } from '@/core/components/Card';
import { DateInput } from '@/core/components/DateInput';
import { Notice } from '@/core/components/Notice';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import { DateParts, toUtcDate, todayParts } from '@/core/date';
import { Colors } from '@/core/theme';
import { useStyles } from '@/core/ThemeProvider';
import { addDays, birthdayInfo, dateDifference, fmtNumber, formatDate } from './engines';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    link: { color: c.primary, fontWeight: '700', fontSize: 13 },
    msg: { color: c.muted, textAlign: 'center', marginVertical: 12 },
  });

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function BirthdayCalculator() {
  const s = useStyles(makeStyles);
  const [dob, setDob] = useState<DateParts>({ day: '15', month: '6', year: '1995' });
  const dobDate = toUtcDate(dob);
  const today = toUtcDate(todayParts());
  const info = useMemo(() => (dobDate && today ? birthdayInfo(dobDate, today) : null), [dob]);

  return (
    <Screen>
      <Card>
        <DateInput label="Date of birth" value={dob} onChange={setDob} />
      </Card>
      {!dobDate ? (
        <Text style={s.msg}>Enter a valid date as DD / MM / YYYY.</Text>
      ) : !info ? (
        <Text style={s.msg}>That date is in the future.</Text>
      ) : (
        <>
          <Hero
            label={info.daysToNext === 0 ? 'Happy birthday!' : 'Next birthday in'}
            value={info.daysToNext === 0 ? '🎉 Today' : plural(info.daysToNext, 'day')}
            sub={`${formatDate(info.next)} · turning ${info.turning}`}
          />
          <Card title="Countdown and details">
            {info.daysToNext > 0 && (
              <StatRow label="That is about" value={`${plural(info.countdown.months, 'month')}, ${plural(info.countdown.days, 'day')}`} />
            )}
            <StatRow label="Current age" value={`${info.age.years}y ${info.age.months}m ${info.age.days}d`} />
            <StatRow label="Days lived" value={fmtNumber(info.totalDays, 0)} />
            <StatRow label="Born on a" value={info.bornOn} />
            <StatRow label="Zodiac sign" value={info.zodiac} />
          </Card>
          <Card title="Milestones">
            {info.milestones.map((m) => (
              <StatRow
                key={m.label}
                label={`${m.label}\n${formatDate(m.date)}`}
                value={m.fromToday === 0 ? 'Today' : m.fromToday > 0 ? `in ${fmtNumber(m.fromToday, 0)} days` : `${fmtNumber(-m.fromToday, 0)} days ago`}
              />
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}

export function DateDifferenceCalculator() {
  const s = useStyles(makeStyles);
  const [mode, setMode] = useState<'diff' | 'add'>('diff');
  const [from, setFrom] = useState<DateParts>({ ...todayParts(), day: '1', month: '1' });
  const [to, setTo] = useState<DateParts>(todayParts());
  const [includeEnd, setIncludeEnd] = useState<'no' | 'yes'>('no');
  const [start, setStart] = useState<DateParts>(todayParts());
  const [op, setOp] = useState<'add' | 'sub'>('add');
  const [days, setDays] = useState(30);

  const a = toUtcDate(from);
  const b = toUtcDate(to);
  const diff = useMemo(() => (a && b ? dateDifference(a, b, includeEnd === 'yes') : null), [from, to, includeEnd]);
  const base = toUtcDate(start);

  return (
    <Screen>
      <Card>
        <Segmented fill options={[{ value: 'diff', label: 'Difference' }, { value: 'add', label: 'Add / subtract days' }]} value={mode} onChange={setMode} />
      </Card>

      {mode === 'diff' ? (
        <>
          <Card>
            <DateInput label="From" value={from} onChange={setFrom} />
            <DateInput label="To" value={to} onChange={setTo} />
            <Pressable onPress={() => setTo(todayParts())}>
              <Text style={s.link}>Set "To" to today</Text>
            </Pressable>
            <Text style={[s.msg, { textAlign: 'left', marginBottom: 8 }]}>Count the end date too?</Text>
            <Segmented fill options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} value={includeEnd} onChange={setIncludeEnd} />
          </Card>
          {!diff ? (
            <Text style={s.msg}>Enter valid dates as DD / MM / YYYY.</Text>
          ) : (
            <>
              <Hero
                label="Difference"
                value={`${diff.years}y ${diff.months}m ${diff.days}d`}
                sub={diff.swapped ? 'The dates were swapped so the result is positive' : `${plural(diff.years, 'year')}, ${plural(diff.months, 'month')}, ${plural(diff.days, 'day')}`}
              />
              <Card title="In other units">
                <StatRow label="Total days" value={fmtNumber(diff.totalDays, 0)} />
                <StatRow label="Weeks and days" value={`${fmtNumber(diff.weeks, 0)} weeks, ${diff.remDays} days`} />
                <StatRow label="Months" value={fmtNumber(diff.totalMonths, 0)} />
                <StatRow label="Hours" value={fmtNumber(diff.hours, 0)} />
                <StatRow label="Working days (Mon to Fri)" value={fmtNumber(diff.business, 0)} />
              </Card>
              <Notice text="Working days count Monday to Friday only and do not exclude public holidays." />
            </>
          )}
        </>
      ) : (
        <>
          <Card>
            <DateInput label="Start date" value={start} onChange={setStart} />
            <Segmented fill options={[{ value: 'add', label: 'Add' }, { value: 'sub', label: 'Subtract' }]} value={op} onChange={setOp} />
            <View style={{ height: 14 }} />
            <SliderInput label="Number of days" suffix=" days" value={days} min={0} max={3650} step={1} onChange={setDays} />
          </Card>
          {base ? (
            <Hero label={op === 'add' ? 'Date after' : 'Date before'} value={formatDate(addDays(base, op === 'add' ? days : -days)).split(', ')[1]} sub={formatDate(addDays(base, op === 'add' ? days : -days)).split(', ')[0]} />
          ) : (
            <Text style={s.msg}>Enter a valid start date.</Text>
          )}
        </>
      )}
    </Screen>
  );
}
