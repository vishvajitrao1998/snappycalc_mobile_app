import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency } from '@/core/format';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import type { YearRow } from './engine';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    head: { borderBottomWidth: 1 },
    cell: { flex: 1 },
    headText: { fontSize: 11, fontWeight: '700', color: c.muted, textTransform: 'uppercase' },
    text: { fontSize: 12, color: c.text, fontWeight: '600' },
    sub: { backgroundColor: c.rowAlt },
    subText: { fontSize: 11, color: c.muted },
  });

export function AmortizationTable({ data }: { data: YearRow[] }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <View>
      <View style={[s.row, s.head]}>
        <Text style={[s.cell, s.headText, { flex: 0.6 }]}>Year</Text>
        <Text style={[s.cell, s.headText]}>Principal</Text>
        <Text style={[s.cell, s.headText]}>Interest</Text>
        <Text style={[s.cell, s.headText]}>Balance</Text>
      </View>
      {data.map((y) => (
        <View key={y.year}>
          <Pressable style={s.row} onPress={() => setOpen(open === y.year ? null : y.year)}>
            <View style={[s.cell, { flex: 0.6, flexDirection: 'row', alignItems: 'center' }]}>
              <Ionicons name={open === y.year ? 'chevron-down' : 'chevron-forward'} size={12} color={colors.muted} />
              <Text style={s.text}> {y.year}</Text>
            </View>
            <Text style={[s.cell, s.text]}>{formatCurrency(y.principal)}</Text>
            <Text style={[s.cell, s.text]}>{formatCurrency(y.interest)}</Text>
            <Text style={[s.cell, s.text]}>{formatCurrency(y.balance)}</Text>
          </Pressable>
          {open === y.year &&
            y.months.map((m) => (
              <View key={m.month} style={[s.row, s.sub]}>
                <Text style={[s.cell, s.subText, { flex: 0.6 }]}>M{m.month}</Text>
                <Text style={[s.cell, s.subText]}>{formatCurrency(m.principal)}</Text>
                <Text style={[s.cell, s.subText]}>{formatCurrency(m.interest)}</Text>
                <Text style={[s.cell, s.subText]}>{formatCurrency(m.balance)}</Text>
              </View>
            ))}
        </View>
      ))}
    </View>
  );
}
