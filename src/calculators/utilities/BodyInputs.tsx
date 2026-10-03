import { useState } from 'react';
import { View } from 'react-native';
import { Card } from '@/core/components/Card';
import { Segmented } from '@/core/components/Segmented';
import { SliderInput } from '@/core/components/SliderInput';
import type { Sex } from './engines';

type Units = 'metric' | 'imperial';

export function useBody() {
  const [units, setUnitsState] = useState<Units>('metric');
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(30);
  const [cm, setCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(7);
  const [kg, setKg] = useState(70);
  const [lb, setLb] = useState(154);

  const setUnits = (u: Units) => {
    if (u === units) return;
    if (u === 'imperial') {
      const totalIn = Math.round(cm / 2.54);
      setFt(Math.floor(totalIn / 12));
      setInch(totalIn % 12);
      setLb(Math.round(kg / 0.45359237));
    } else {
      setCm(Math.round((ft * 12 + inch) * 2.54));
      setKg(Math.round(lb * 0.45359237));
    }
    setUnitsState(u);
  };

  return {
    units, setUnits, sex, setSex, age, setAge, cm, setCm, ft, setFt, inch, setInch, kg, setKg, lb, setLb,
    heightCm: units === 'metric' ? cm : (ft * 12 + inch) * 2.54,
    weightKg: units === 'metric' ? kg : lb * 0.45359237,
  };
}
export type Body = ReturnType<typeof useBody>;

export function BodyInputs({ body, showSex = false, showAge = false }: { body: Body; showSex?: boolean; showAge?: boolean }) {
  const b = body;
  return (
    <Card>
      <Segmented
        fill
        options={[{ value: 'metric', label: 'Metric (cm, kg)' }, { value: 'imperial', label: 'Imperial (ft, lb)' }]}
        value={b.units}
        onChange={b.setUnits}
      />
      {showSex && (
        <>
          <Gap />
          <Segmented fill options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={b.sex} onChange={b.setSex} />
        </>
      )}
      <Gap />
      {showAge && <SliderInput label="Age" suffix=" yr" value={b.age} min={15} max={100} step={1} onChange={b.setAge} />}
      {b.units === 'metric' ? (
        <>
          <SliderInput label="Height" suffix=" cm" value={b.cm} min={100} max={230} step={1} onChange={b.setCm} />
          <SliderInput label="Weight" suffix=" kg" value={b.kg} min={20} max={250} step={1} onChange={b.setKg} />
        </>
      ) : (
        <>
          <SliderInput label="Height (feet)" suffix=" ft" value={b.ft} min={3} max={7} step={1} onChange={b.setFt} />
          <SliderInput label="Height (inches)" suffix=" in" value={b.inch} min={0} max={11} step={1} onChange={b.setInch} />
          <SliderInput label="Weight" suffix=" lb" value={b.lb} min={44} max={550} step={1} onChange={b.setLb} />
        </>
      )}
    </Card>
  );
}

const Gap = () => <View style={{ height: 14 }} />;
