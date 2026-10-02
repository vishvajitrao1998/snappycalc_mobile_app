import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { LOCALE } from '../format';
import { Colors } from '../theme';
import { useStyles, useTheme } from '../ThemeProvider';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  accessory?: ReactNode;
  onChange: (v: number) => void;
};

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { marginBottom: 18 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { flex: 1, fontSize: 14, fontWeight: '600', color: c.text },
    accessory: { marginRight: 8 },
    box: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primarySoft, borderRadius: 10, paddingHorizontal: 10 },
    input: { minWidth: 70, paddingVertical: 6, textAlign: 'right', fontWeight: '700', color: c.primary },
    affix: { color: c.primary, fontWeight: '700' },
    hint: { fontSize: 11, color: c.muted },
  });

export function SliderInput({ label, value, min, max, step = 1, prefix = '', suffix = '', accessory, onChange }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = Number(text.replace(/[^0-9.]/g, ''));
    const clamped = Number.isNaN(n) ? value : Math.min(max, Math.max(min, n));
    onChange(clamped);
    setText(String(clamped));
  };
  const hint = (n: number) => `${prefix}${n.toLocaleString(LOCALE)}${suffix}`;

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        {accessory ? <View style={s.accessory}>{accessory}</View> : null}
        <View style={s.box}>
          {prefix ? <Text style={s.affix}>{prefix}</Text> : null}
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            onBlur={commit}
            onSubmitEditing={commit}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
          {suffix ? <Text style={s.affix}>{suffix}</Text> : null}
        </View>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
      <View style={s.row}>
        <Text style={s.hint}>{hint(min)}</Text>
        <Text style={s.hint}>{hint(max)}</Text>
      </View>
    </View>
  );
}
