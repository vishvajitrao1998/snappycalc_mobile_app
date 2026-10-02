import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { groupedCalculators } from '@/calculators/registry';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    section: { fontSize: 13, fontWeight: '700', color: c.muted, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
    card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, padding: 14, borderRadius: 20, marginBottom: 10 },
    icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: c.text },
    desc: { fontSize: 13, color: c.muted, marginTop: 2 },
  });

export default function Calculators() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <SectionList
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      sections={groupedCalculators()}
      keyExtractor={(c) => c.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
      renderItem={({ item }) => (
        <Link href={{ pathname: '/calculator/[id]', params: { id: item.id } }} asChild>
          <Pressable style={s.card}>
            <View style={s.icon}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.desc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </Link>
      )}
    />
  );
}
