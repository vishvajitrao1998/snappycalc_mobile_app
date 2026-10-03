import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme';
import { useStyles, useTheme } from '../ThemeProvider';

export type LineSeries = { name: string; color: string; values: number[] };
type Props = {
  series: LineSeries[];
  labels: string[];
  height?: number;
  format: (n: number) => string;
};

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    legend: { flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap' },
    item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    text: { color: c.muted, fontSize: 12 },
  });

export function LineChart({ series, labels, height = 220, format }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padL = 62;
  const padR = 8;
  const padT = 8;
  const padB = 22;
  const all = series.flatMap((x) => x.values);
  const min = Math.min(0, ...all);
  const max = Math.max(1, ...all);
  const n = labels.length;
  const plotW = Math.max(1, width - padL - padR);
  const plotH = height - padT - padB;
  const x = (i: number) => padL + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * plotH;
  const ticks = [0, 1, 2, 3].map((k) => min + ((max - min) * k) / 3);
  const labelEvery = Math.ceil(n / 6);

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {ticks.map((t) => (
              <G key={t}>
                <Line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke={colors.border} strokeWidth={1} />
                <SvgText x={padL - 6} y={y(t) + 4} fontSize={10} fill={colors.muted} textAnchor="end">
                  {format(t)}
                </SvgText>
              </G>
            ))}
            {series.map((line) => (
              <Path
                key={line.name}
                d={line.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')}
                stroke={line.color}
                strokeWidth={2.5}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {labels.map((l, i) =>
              i % labelEvery === 0 || i === n - 1 ? (
                <SvgText key={l} x={x(i)} y={height - 6} fontSize={10} fill={colors.muted} textAnchor="middle">
                  {l}
                </SvgText>
              ) : null,
            )}
          </Svg>
        )}
      </View>
      <View style={s.legend}>
        {series.map((line) => (
          <View key={line.name} style={s.item}>
            <View style={[s.dot, { backgroundColor: line.color }]} />
            <Text style={s.text}>{line.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
