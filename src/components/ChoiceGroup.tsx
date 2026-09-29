import { Pressable, StyleSheet, Text, View } from 'react-native';

type ChoiceGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function ChoiceGroup({ label, options, value, onChange }: ChoiceGroupProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => (
          <Pressable key={option} style={[styles.choice, value === option && styles.choiceSelected]} onPress={() => onChange(option)}>
            <Text style={[styles.choiceText, value === option && styles.choiceTextSelected]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { 
    color: '#3e4a57',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 7 
    },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    backgroundColor: '#fff',
    borderColor: '#dce1e7',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  choiceSelected: {
    backgroundColor: '#18212b',
    borderColor: '#18212b',
  },
  choiceText: {
    color: '#596573',
    fontSize: 14,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: '#fff',
  },
});
