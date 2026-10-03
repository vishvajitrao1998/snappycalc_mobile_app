import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../theme';
import { useStyles, useTheme } from '../ThemeProvider';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
};

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { marginBottom: 14 },
    label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 8 },
    box: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primarySoft, borderRadius: 12, paddingHorizontal: 14 },
    input: { flex: 1, paddingVertical: 12, fontSize: 18, fontWeight: '700', color: c.primary },
    affix: { color: c.primary, fontWeight: '700', fontSize: 16 },
  });

/** Free-typed number field (no slider). Value stays a string so partial input like "12." works. */
export function NumberInput({ label, value, onChange, prefix, suffix, placeholder }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.box}>
        {prefix ? <Text style={s.affix}>{prefix} </Text> : null}
        <TextInput
          style={s.input}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9.\-]/g, ''))}
          keyboardType="numbers-and-punctuation"
          placeholder={placeholder ?? '0'}
          placeholderTextColor={colors.muted}
          selectTextOnFocus
        />
        {suffix ? <Text style={s.affix}> {suffix}</Text> : null}
      </View>
    </View>
  );
}
