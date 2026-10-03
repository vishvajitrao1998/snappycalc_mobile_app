import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card, Hero, Screen, StatRow } from '@/core/components/Card';
import { NumberInput } from '@/core/components/NumberInput';
import { Notice } from '@/core/components/Notice';
import { Colors } from '@/core/theme';
import { useStyles, useTheme } from '@/core/ThemeProvider';
import { fmtNumber } from '../utilities/engines';
import { CurrencyPicker } from './CurrencyPicker';
import { convert, loadRates, NAMES, POPULAR, RateData } from './rates';

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    swap: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    center: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    msg: { color: c.muted, textAlign: 'center' },
    retry: { backgroundColor: c.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    retryText: { color: '#fff', fontWeight: '700' },
    link: { color: c.primary, fontSize: 12, textAlign: 'center', marginBottom: 14 },
  });

export function CurrencyConverter() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [data, setData] = useState<RateData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(false);
    try {
      setData(await loadRates(force));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const codes = useMemo(() => (data ? Object.keys(data.rates) : []), [data]);
  const amt = parseFloat(amount);
  const valid = data && Number.isFinite(amt) && data.rates[from] && data.rates[to];
  const result = valid ? convert(amt, from, to, data.rates) : null;
  const unit = data && data.rates[from] && data.rates[to] ? convert(1, from, to, data.rates) : null;

  if (loading && !data) {
    return (
      <Screen>
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.msg}>Loading live exchange rates…</Text>
        </View>
      </Screen>
    );
  }
  if (error && !data) {
    return (
      <Screen>
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.muted} />
          <Text style={s.msg}>Could not load exchange rates. Check your internet connection and try again.</Text>
          <Pressable style={s.retry} onPress={() => load(true)}>
            <Text style={s.retryText}>Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <NumberInput label="Amount" value={amount} onChange={setAmount} />
        <View style={s.row}>
          <CurrencyPicker label="From" value={from} codes={codes} onChange={setFrom} />
          <Pressable
            style={s.swap}
            onPress={() => {
              setFrom(to);
              setTo(from);
            }}
            accessibilityLabel="Swap currencies"
          >
            <Ionicons name="swap-horizontal" size={20} color="#fff" />
          </Pressable>
          <CurrencyPicker label="To" value={to} codes={codes} onChange={setTo} />
        </View>
      </Card>

      {result !== null && unit !== null ? (
        <Hero
          label={`${fmtNumber(amt, 2)} ${from} =`}
          value={`${fmtNumber(result, 2)} ${to}`}
          sub={`1 ${from} = ${fmtNumber(unit, 4)} ${to}`}
        />
      ) : (
        <Notice text="Enter a valid amount." />
      )}

      {data && result !== null && (
        <Card title={`${fmtNumber(amt, 2)} ${from} in other currencies`}>
          {POPULAR.filter((c) => c !== from && data.rates[c]).slice(0, 7).map((c) => (
            <StatRow key={c} label={`${c}  ${NAMES[c] ?? ''}`} value={fmtNumber(convert(amt, from, c, data.rates), 2)} />
          ))}
        </Card>
      )}

      <Pressable onPress={() => Linking.openURL('https://www.exchangerate-api.com')}>
        <Text style={s.link}>Rates By Exchange Rate API</Text>
      </Pressable>
      <Notice text={`Mid-market rates updated once a day${data?.updated ? ` (last update: ${data.updated.replace(' +0000', ' UTC')})` : ''}. Banks and money changers add their own margin, so the rate you get will differ.`} />
    </Screen>
  );
}
