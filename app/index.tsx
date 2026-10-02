import { theme } from '@/core/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  return (
    <SafeAreaView style={s.screen}>
      {/* decorative background circles */}
      <View style={[s.circle, { width: 320, height: 320, top: -100, right: -120 }]} />
      <View style={[s.circle, { width: 220, height: 220, bottom: 120, left: -90 }]} />

      <Animated.View style={[s.center, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={s.logo}>
          <Ionicons name="calculator" size={44} color={theme.colors.primary} />
        </View>
        <Text style={s.title}>SnappyCalc</Text>
        <Text style={s.desc}>Making Financial Calculators Easy</Text>
      </Animated.View>

      <Animated.View style={[s.footer, { opacity: fade }]}>
        <Pressable
          style={({ pressed }) => [s.button, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push('/calculators')}
        >
          <Text style={s.buttonText}>Let's Start</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.primary },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  desc: { fontSize: 16, color: '#C7D2FE', marginTop: 10, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 18,
  },
  buttonText: { fontSize: 17, fontWeight: '700', color: theme.colors.primary },
});
