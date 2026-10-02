import { StyleSheet, Text, TextInput, View } from 'react-native';
import { DateParts } from '../date';
import { Colors } from '../theme';
import { useStyles } from '../ThemeProvider';

const FIELDS: { key: keyof DateParts; ph: string; len: number; w: number }[] = [
  { key: 'day', ph: 'DD', len: 2, w: 52 },
  { key: 'month', ph: 'MM', len: 2, w: 52 },
  { key: 'year', ph: 'YYYY', len: 4, w: 78 },
];

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { marginBottom: 14 },
    label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { backgroundColor: c.primarySoft, color: c.primary, fontWeight: '700', fontSize: 16, textAlign: 'center', borderRadius: 10, paddingVertical: 10 },
    sep: { color: c.muted, fontSize: 18 },
  });

export function DateInput({ label, value, onChange }: { label: string; value: DateParts; onChange: (v: DateParts) => void }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        {FIELDS.map((f, i) => (
          <View key={f.key} style={s.row}>
            <TextInput
              style={[s.input, { width: f.w }]}
              value={value[f.key]}
              placeholder={f.ph}
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={f.len}
              selectTextOnFocus
              onChangeText={(t) => onChange({ ...value, [f.key]: t.replace(/\D/g, '') })}
            />
            {i < FIELDS.length - 1 ? <Text style={s.sep}>/</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
