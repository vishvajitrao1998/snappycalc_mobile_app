import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Hero, LegendRow, Screen, StatRow } from '@/core/components/Card';
import { DonutChart } from '@/core/components/DonutChart';
import { Notice } from '@/core/components/Notice';
import { OptionList } from '@/core/components/OptionList';
import { Segmented } from '@/core/components/Segmented';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import { BodyInputs, useBody } from './BodyInputs';
import { ACTIVITY, BmrFormula, calculateBmi, calculateBmr, calculateCalories, fmtNumber, MACROS } from './engines';

const BMI_COLORS = ['#60A5FA', '#10B981', '#F59E0B', '#EF4444'];

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 8 },
    marker: { position: 'absolute', top: -4, width: 4, height: 20, borderRadius: 2, backgroundColor: c.text },
    scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    scaleText: { fontSize: 11, color: c.muted },
  });

function BmiBar({ bmi, cuts }: { bmi: number; cuts: number[] }) {
  const s = useStyles(makeStyles);
  const MIN = 15;
  const MAX = 40;
  const edges = [MIN, ...cuts, MAX];
  const pos = Math.min(1, Math.max(0, (bmi - MIN) / (MAX - MIN)));
  return (
    <View>
      <View>
        <View style={s.bar}>
          {BMI_COLORS.map((color, i) => (
            <View key={color} style={{ flex: edges[i + 1] - edges[i], backgroundColor: color }} />
          ))}
        </View>
        <View style={[s.marker, { left: `${pos * 100}%`, marginLeft: -2 }]} />
      </View>
      <View style={s.scale}>
        {[MIN, ...cuts, MAX].map((v) => (
          <Text key={v} style={s.scaleText}>{v}</Text>
        ))}
      </View>
    </View>
  );
}

export function BmiCalculator() {
  const body = useBody();
  const [scale, setScale] = useState<'who' | 'asian'>('who');
  const r = useMemo(() => calculateBmi(body.weightKg, body.heightCm, scale), [body.weightKg, body.heightCm, scale]);
  const { units } = body;
  const w = (kg: number) => (units === 'metric' ? `${fmtNumber(kg, 1)} kg` : `${fmtNumber(kg / 0.45359237, 0)} lb`);

  return (
    <Screen>
      <BodyInputs body={body} />
      <Card>
        <Segmented fill options={[{ value: 'who', label: 'Standard (WHO)' }, { value: 'asian', label: 'Asian adults' }]} value={scale} onChange={setScale} />
      </Card>
      <Hero label={`Your BMI: ${r.label}`} value={r.bmi.toFixed(1)} sub={`Healthy weight for your height: ${w(r.healthyMin)} to ${w(r.healthyMax)}`} />
      <Card title="BMI scale">
        <BmiBar bmi={r.bmi} cuts={r.cuts} />
        <View style={{ height: 8 }} />
        <LegendRow color={BMI_COLORS[0]} label="Underweight" value={`below ${r.cuts[0]}`} />
        <LegendRow color={BMI_COLORS[1]} label="Normal" value={`${r.cuts[0]} to ${(r.cuts[1] - 0.1).toFixed(1)}`} />
        <LegendRow color={BMI_COLORS[2]} label="Overweight" value={`${r.cuts[1]} to ${(r.cuts[2] - 0.1).toFixed(1)}`} />
        <LegendRow color={BMI_COLORS[3]} label="Obese" value={`${r.cuts[2]} and above`} />
      </Card>
      <Notice text="BMI is a quick screening number for adults. It does not separate muscle from fat or reflect where weight is carried, and it does not apply to children or pregnancy. For health decisions, speak to a doctor." />
    </Screen>
  );
}

export function BmrCalculator() {
  const body = useBody();
  const [formula, setFormula] = useState<BmrFormula>('mifflin');
  const bmr = calculateBmr(body.sex, body.weightKg, body.heightCm, body.age, formula);

  return (
    <Screen>
      <BodyInputs body={body} showSex showAge />
      <Card>
        <Segmented fill options={[{ value: 'mifflin', label: 'Mifflin-St Jeor' }, { value: 'harris', label: 'Harris-Benedict' }]} value={formula} onChange={setFormula} />
      </Card>
      <Hero label="Basal metabolic rate" value={`${fmtNumber(bmr, 0)} kcal/day`} sub="Calories your body burns at complete rest" />
      <Card title="Daily calories by activity level">
        {ACTIVITY.map((a) => (
          <StatRow key={a.value} label={a.label} value={`${fmtNumber(bmr * a.factor, 0)} kcal`} />
        ))}
      </Card>
      <Notice text="Mifflin-St Jeor is generally considered the more accurate of the two for most adults. These are estimates, and real needs vary from person to person." />
    </Screen>
  );
}

export function CalorieCalculator() {
  const { colors } = useTheme();
  const body = useBody();
  const [activity, setActivity] = useState<(typeof ACTIVITY)[number]['value']>('light');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [pace, setPace] = useState<'250' | '500' | '750'>('500');
  const [macro, setMacro] = useState<keyof typeof MACROS>('balanced');

  const r = useMemo(() => {
    const bmr = calculateBmr(body.sex, body.weightKg, body.heightCm, body.age, 'mifflin');
    const factor = ACTIVITY.find((a) => a.value === activity)?.factor ?? 1.375;
    const bmi = calculateBmi(body.weightKg, body.heightCm, 'who').bmi;
    return calculateCalories({ sex: body.sex, bmr, factor, goal, pace: Number(pace), bmi, macro });
  }, [body.sex, body.weightKg, body.heightCm, body.age, activity, goal, pace, macro]);

  return (
    <Screen>
      <BodyInputs body={body} showSex showAge />
      <Card title="Activity level">
        <OptionList options={ACTIVITY.map((a) => ({ value: a.value, label: a.label, hint: a.hint }))} value={activity} onChange={setActivity} />
      </Card>
      <Card title="Goal">
        <Segmented
          fill
          options={[{ value: 'lose', label: 'Lose weight' }, { value: 'maintain', label: 'Maintain' }, { value: 'gain', label: 'Gain weight' }]}
          value={goal}
          onChange={setGoal}
        />
        {goal !== 'maintain' && (
          <>
            <View style={{ height: 12 }} />
            <Segmented fill options={[{ value: '250', label: 'Slow' }, { value: '500', label: 'Moderate' }, { value: '750', label: 'Fast' }]} value={pace} onChange={setPace} />
          </>
        )}
        <View style={{ height: 12 }} />
        <Segmented fill options={Object.entries(MACROS).map(([value, m]) => ({ value: value as keyof typeof MACROS, label: m.label }))} value={macro} onChange={setMacro} />
      </Card>

      <Hero label="Daily calorie target" value={`${fmtNumber(r.target, 0)} kcal`} sub={`Maintenance: ${fmtNumber(r.maintenance, 0)} kcal/day`} />
      {r.lowBmi && <Notice text="Your BMI is below 18.5, so no calorie deficit is shown. If you are thinking about losing weight, please talk to a doctor first." />}
      {r.capped && <Notice text={`The target was held at a safe minimum of ${body.sex === 'male' ? '1,500' : '1,200'} kcal a day. For a larger deficit, get advice from a doctor or dietitian.`} />}

      <Card title="Macros per day">
        <DonutChart
          segments={[
            { value: r.protein * 4, color: colors.primary },
            { value: r.carbs * 4, color: colors.interest },
            { value: r.fat * 9, color: colors.gain },
          ]}
          centerTop="Target"
          centerBottom={`${fmtNumber(r.target, 0)}`}
        />
        <LegendRow color={colors.primary} label="Protein" value={`${fmtNumber(r.protein, 0)} g`} />
        <LegendRow color={colors.interest} label="Carbohydrates" value={`${fmtNumber(r.carbs, 0)} g`} />
        <LegendRow color={colors.gain} label="Fat" value={`${fmtNumber(r.fat, 0)} g`} />
        {goal !== 'maintain' && !r.lowBmi && (
          <StatRow label="Expected change per week" value={`${r.weeklyKg > 0 ? '+' : ''}${fmtNumber(r.weeklyKg, 2)} kg`} />
        )}
      </Card>
      <Notice text="These are estimates based on the Mifflin-St Jeor equation and a standard activity multiplier. They are not medical advice. Check with a doctor or dietitian before changing your diet, especially if you have a health condition." />
    </Screen>
  );
}
