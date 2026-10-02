import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme';
import { useStyles } from '../ThemeProvider';

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = { options: Option<T>[]; value: T; onChange: (v: T) => void; fill?: boolean };

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', backgroundColor: c.primarySoft, borderRadius: 10, padding: 2 },
    btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
    on: { backgroundColor: c.primary },
    text: { fontWeight: '700', color: c.primary, fontSize: 12 },
    textOn: { color: '#fff' },
  });

export function Segmented<T extends string>({ options, value, onChange, fill }: Props<T>) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.wrap}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.btn, fill && { flex: 1 }, value === o.value && s.on]}>
          <Text style={[s.text, value === o.value && s.textOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
