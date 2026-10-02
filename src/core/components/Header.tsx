import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../theme';
import { useStyles, useTheme } from '../ThemeProvider';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logo: { width: 28, height: 28, borderRadius: 9, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    brand: { fontSize: 21, fontWeight: '800', color: c.text, letterSpacing: -0.6 },
    accent: { color: c.primary },
    toggle: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  });

export function BrandTitle() {
  const s = useStyles(makeStyles);
  return (
    <View style={s.row}>
      <View style={s.logo}>
        <Ionicons name="flash" size={16} color="#fff" />
      </View>
      <Text style={s.brand}>
        Snappy<Text style={s.accent}>Calc</Text>
      </Text>
    </View>
  );
}

export function ThemeToggle() {
  const s = useStyles(makeStyles);
  const { isDark, toggle, colors } = useTheme();
  return (
    <Pressable onPress={toggle} style={s.toggle} accessibilityLabel="Toggle dark mode" hitSlop={8}>
      <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.primary} />
    </Pressable>
  );
}
