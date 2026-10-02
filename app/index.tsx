import { groupedCalculators } from '@/calculators/registry';
import { theme } from '@/core/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <SectionList
      contentContainerStyle={{ padding: 16 }}
      sections={groupedCalculators()}
      keyExtractor={(c) => c.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
      renderItem={({ item }) => (
        <Link href={{ pathname: '/calculator/[id]', params: { id: item.id } }} asChild>
          <Pressable style={s.card}>
            <View style={s.icon}>
              <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.desc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
          </Pressable>
        </Link>
      )}
    />
  );
}

const s = StyleSheet.create({
  section: { fontSize: 13, fontWeight: '700', color: theme.colors.muted, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.card, padding: 14, borderRadius: theme.radius.lg, marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  desc: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
});
