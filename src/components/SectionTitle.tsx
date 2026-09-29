import { StyleSheet, Text } from 'react-native';

export function SectionTitle({ text }: { text: string }) {
  return <Text style={styles.title}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: '#18212b',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    marginTop: 18,
  },
});
