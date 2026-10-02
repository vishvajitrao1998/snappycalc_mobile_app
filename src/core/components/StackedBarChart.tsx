import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../ThemeProvider';

export type Bar = { label: string; bottom: number; top: number };
type Props = { data: Bar[]; height?: number; bottomColor: string; topColor: string };

export function StackedBarChart({ data, height = 180, bottomColor, topColor }: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padB = 20;
  const chartH = height - padB;
  const max = Math.max(1, ...data.map((d) => d.bottom + d.top));
  const slot = data.length ? width / data.length : 0;
  const barW = Math.max(2, slot * 0.6);
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={0} x2={width} y1={chartH} y2={chartH} stroke={colors.border} />
          {data.map((d, i) => {
            const x = i * slot + (slot - barW) / 2;
            const hB = (d.bottom / max) * chartH;
            const hT = (d.top / max) * chartH;
            return (
              <G key={i}>
                <Rect x={x} y={chartH - hB} width={barW} height={hB} fill={bottomColor} />
                <Rect x={x} y={chartH - hB - hT} width={barW} height={hT} fill={topColor} />
                {i % labelEvery === 0 && (
                  <SvgText x={x + barW / 2} y={height - 5} fontSize={10} fill={colors.muted} textAnchor="middle">
                    {d.label}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}
