import { type ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export function FormField({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#89919d" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderColor: '#dce1e7',
    borderRadius: 12,
    borderWidth: 1,
    color: '#18212b',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  label: {
    color: '#3e4a57',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 14,
  },
});
