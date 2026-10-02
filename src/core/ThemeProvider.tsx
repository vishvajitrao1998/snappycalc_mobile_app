import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, darkColors, lightColors } from './theme';

type Ctx = { colors: Colors; isDark: boolean; toggle: () => void };
const ThemeContext = createContext<Ctx>({ colors: lightColors, isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [override, setOverride] = useState<'light' | 'dark' | null>(null);
  const isDark = (override ?? system) === 'dark';
  const toggle = useCallback(() => setOverride(isDark ? 'light' : 'dark'), [isDark]);
  const value = useMemo(() => ({ colors: isDark ? darkColors : lightColors, isDark, toggle }), [isDark, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Usage: const makeStyles = (c: Colors) => StyleSheet.create({...}); const s = useStyles(makeStyles); */
export function useStyles<T>(factory: (c: Colors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
