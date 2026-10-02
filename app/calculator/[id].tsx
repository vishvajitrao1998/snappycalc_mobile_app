import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getCalculator } from '@/calculators/registry';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
    icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '800', color: c.text },
    desc: { fontSize: 12, color: c.muted, marginTop: 2 },
  });

export default function CalculatorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const calc = getCalculator(id);
  const s = useStyles(makeStyles);
  const { colors } = useTheme();

  if (!calc) {
    return <View style={{ padding: 24 }}><Text style={s.desc}>Calculator not found.</Text></View>;
  }
  const { Component } = calc;
  return (
    <View style={{ flex: 1 }}>
      <View style={s.head}>
        <View style={s.icon}>
          <Ionicons name={calc.icon} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{calc.title}</Text>
          <Text style={s.desc}>{calc.description}</Text>
        </View>
      </View>
      <Component />
    </View>
  );
}
