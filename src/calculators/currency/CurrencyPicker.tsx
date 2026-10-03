import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import { NAMES, POPULAR } from './rates';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    button: { flex: 1, backgroundColor: c.primarySoft, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
    buttonLabel: { fontSize: 11, color: c.muted },
    buttonCode: { fontSize: 18, fontWeight: '800', color: c.primary, marginTop: 2 },
    screen: { flex: 1, backgroundColor: c.bg },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    title: { fontSize: 18, fontWeight: '800', color: c.text },
    search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    input: { flex: 1, paddingVertical: 12, color: c.text, fontSize: 15 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    code: { width: 56, fontWeight: '800', color: c.text },
    name: { flex: 1, color: c.muted },
  });

type Props = { label: string; value: string; codes: string[]; onChange: (code: string) => void };

export function CurrencyPicker({ label, value, codes, onChange }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...codes].sort((a, b) => {
      const pa = POPULAR.indexOf(a);
      const pb = POPULAR.indexOf(b);
      if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return a.localeCompare(b);
    });
    return q ? sorted.filter((c) => c.toLowerCase().includes(q) || (NAMES[c] ?? '').toLowerCase().includes(q)) : sorted;
  }, [codes, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Pressable style={s.button} onPress={() => setOpen(true)}>
        <Text style={s.buttonLabel}>{label}</Text>
        <Text style={s.buttonCode}>{value} ▾</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <SafeAreaView style={s.screen}>
          <View style={s.head}>
            <Text style={s.title}>Choose currency</Text>
            <Pressable onPress={close} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>
          <View style={s.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={s.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search code or name"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <FlatList
            data={list}
            keyExtractor={(c) => c}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={s.row}
                onPress={() => {
                  onChange(item);
                  close();
                }}
              >
                <Text style={s.code}>{item}</Text>
                <Text style={s.name}>{NAMES[item] ?? ''}</Text>
                {item === value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
