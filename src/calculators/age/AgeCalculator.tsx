import { Card, Hero, Screen, StatRow } from '@/core/components/Card';
import { DateInput } from '@/core/components/DateInput';
import { DateParts, toUtcDate, todayParts } from '@/core/date';
import { LOCALE } from '@/core/format';
import { Colors } from '@/core/theme';
import { useStyles } from '@/core/ThemeProvider';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { calculateAge } from './engine';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    msg: { color: c.muted, textAlign: 'center', marginVertical: 12 },
    link: { color: c.primary, fontWeight: '700', fontSize: 13 },
  });

const n = (v: number) => v.toLocaleString(LOCALE);

export function AgeCalculator() {
  const s = useStyles(makeStyles);
  const [dob, setDob] = useState<DateParts>({ day: '15', month: '6', year: '1995' });
  const [asOf, setAsOf] = useState<DateParts>(todayParts());

  const { dobDate, asOfDate, age } = useMemo(() => {
    const dobDate = toUtcDate(dob);
    const asOfDate = toUtcDate(asOf);
    return { dobDate, asOfDate, age: dobDate && asOfDate ? calculateAge(dobDate, asOfDate) : null };
  }, [dob, asOf]);

  return (
    <Screen>
      <Card>
        <DateInput label="Date of birth" value={dob} onChange={setDob} />
        <DateInput label="Age on" value={asOf} onChange={setAsOf} />
        <Pressable onPress={() => setAsOf(todayParts())}>
          <Text style={s.link}>Set to today</Text>
        </Pressable>
      </Card>

      {!dobDate || !asOfDate ? (
        <Text style={s.msg}>Enter valid dates as DD / MM / YYYY.</Text>
      ) : !age ? (
        <Text style={s.msg}>Date of birth must be before the "Age on" date.</Text>
      ) : (
        <>
          <Hero label="Your age" value={`${age.years}y ${age.months}m ${age.days}d`} sub={`${age.years} years, ${age.months} months, ${age.days} days`} />
          <Card title="In numbers">
            <StatRow label="Months" value={n(age.totalMonths)} />
            <StatRow label="Weeks" value={n(age.totalWeeks)} />
            <StatRow label="Days" value={n(age.totalDays)} />
            <StatRow label="Hours" value={n(age.totalHours)} />
          </Card>
          <Card title="Birthday">
            <StatRow label="Born on" value={age.bornOnWeekday} />
            <StatRow
              label="Next birthday"
              value={age.daysToNextBirthday === 0 ? 'Today 🎉' : `in ${age.daysToNextBirthday} days (${age.nextBirthdayWeekday})`}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
