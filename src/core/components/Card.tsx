import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme';
import { useStyles } from '../ThemeProvider';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    card: { backgroundColor: c.card, borderRadius: 20, padding: 16, marginBottom: 14 },
    title: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 14 },
    legend: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    label: { flex: 1, color: c.muted },
    value: { fontWeight: '700', color: c.text },
    hero: { backgroundColor: c.heroBg, borderRadius: 20, padding: 20, marginBottom: 14, alignItems: 'center' },
    heroLabel: { color: c.heroMuted, fontSize: 13 },
    heroValue: { color: c.heroText, fontSize: 32, fontWeight: '800', marginTop: 4 },
    heroSub: { color: c.heroMuted, fontSize: 12, marginTop: 6 },
  });

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Card({ title, children }: PropsWithChildren<{ title?: string }>) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.card}>
      {title ? <Text style={s.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.legend}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function StatRow({ label, value }: { label: string; value: string }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.legend}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function Hero({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.hero}>
      <Text style={s.heroLabel}>{label}</Text>
      <Text style={s.heroValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {sub ? <Text style={s.heroSub}>{sub}</Text> : null}
    </View>
  );
}
