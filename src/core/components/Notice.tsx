import { StyleSheet, Text } from 'react-native';
import { Colors } from '../theme';
import { useStyles } from '../ThemeProvider';

const makeStyles = (c: Colors) =>
  StyleSheet.create({ notice: { color: c.muted, fontSize: 12, lineHeight: 18, marginBottom: 14, paddingHorizontal: 4 } });

export function Notice({ text }: { text: string }) {
  const s = useStyles(makeStyles);
  return <Text style={s.notice}>{text}</Text>;
}
