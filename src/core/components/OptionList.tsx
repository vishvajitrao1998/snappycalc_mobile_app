import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme';
import { useStyles } from '../ThemeProvider';

type Option<T extends string> = { value: T; label: string; hint?: string };
type Props<T extends string> = { options: Option<T>[]; value: T; onChange: (v: T) => void };

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    radioOn: { borderColor: c.primary },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary },
    label: { color: c.text, fontWeight: '600', fontSize: 14 },
    hint: { color: c.muted, fontSize: 12, marginTop: 1 },
  });

export function OptionList<T extends string>({ options, value, onChange }: Props<T>) {
  const s = useStyles(makeStyles);
  return (
    <View>
      {options.map((o) => (
        <Pressable key={o.value} style={s.row} onPress={() => onChange(o.value)}>
          <View style={[s.radio, value === o.value && s.radioOn]}>{value === o.value && <View style={s.dot} />}</View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{o.label}</Text>
            {o.hint ? <Text style={s.hint}>{o.hint}</Text> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
