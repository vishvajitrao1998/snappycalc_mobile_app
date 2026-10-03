import { groupedCalculators } from '@/calculators/registry';
import type { CalculatorDefinition } from '@/calculators/types';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    searchWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    input: { flex: 1, paddingVertical: 12, fontSize: 15, color: c.text },
    section: { fontSize: 13, fontWeight: '700', color: c.muted, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
    card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, padding: 14, borderRadius: 20, marginBottom: 10 },
    icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: c.text },
    desc: { fontSize: 13, color: c.muted, marginTop: 2 },
    empty: { alignItems: 'center', marginTop: 60, gap: 8 },
    emptyText: { color: c.muted, fontSize: 14 },
  });

/** Every word typed must appear in the title, description, category or id. */
const matches = (calc: CalculatorDefinition & { category: string }, query: string) => {
  const haystack = `${calc.title} ${calc.description} ${calc.category} ${calc.id}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

export default function Calculators() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const sections = useMemo(
    () =>
      groupedCalculators()
        .map((section) => ({ ...section, data: section.data.filter((c) => matches(c, query)) }))
        .filter((section) => section.data.length > 0),
    [query],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={s.searchWrap}>
        <View style={s.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={s.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search calculators (e.g. loan, sip, age)"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <SectionList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        sections={sections}
        keyExtractor={(c) => c.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={36} color={colors.muted} />
            <Text style={s.emptyText}>No calculators found for "{query}"</Text>
          </View>
        }
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
    </View>
  );
}