import { Stack } from 'expo-router';
import { BrandTitle, ThemeToggle } from '@/core/components/Header';
import { ThemeProvider, useTheme } from '@/core/ThemeProvider';

function ThemedStack() {
  const { colors, isDark } = useTheme();
  return (
    <Stack
      screenOptions={{
        statusBarStyle: isDark ? 'light' : 'dark',
        headerTitle: () => <BrandTitle />,
        headerRight: () => <ThemeToggle />,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: 'light' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
