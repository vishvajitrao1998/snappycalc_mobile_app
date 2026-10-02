import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../theme';
import { useStyles, useTheme } from '../ThemeProvider';

export type Segment = { value: number; color: string };
type Props = { segments: Segment[]; size?: number; stroke?: number; centerTop?: string; centerBottom?: string };

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    top: { fontSize: 12, color: c.muted },
    bottom: { fontSize: 18, fontWeight: '800', color: c.text },
  });

export function DonutChart({ segments, size = 180, stroke = 22, centerTop, centerBottom }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((a, b) => a + b.value, 0);
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
          {segments.map((seg, i) => {
            const len = total > 0 ? (seg.value / total) * C : 0;
            const el = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={seg.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, s.center]}>
        {centerTop ? <Text style={s.top}>{centerTop}</Text> : null}
        {centerBottom ? <Text style={s.bottom}>{centerBottom}</Text> : null}
      </View>
    </View>
  );
}
