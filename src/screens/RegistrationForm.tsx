import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { FormField } from '../components/FormField';
import { SectionTitle } from '../components/SectionTitle';
import { createUser, getUserByEmail } from '../database/database';
import { genderOptions, goalOptions, type UserRecord } from '../types/user';

export function RegistrationForm({ onSaved }: { onSaved: (user: UserRecord) => void }) {
  const db = useSQLiteContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [consent, setConsent] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').replace(/^380/, '').slice(0, 9);
    let formatted = '+380';
    if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += ')';
    if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
    setPhone(formatted);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Потрібен дозвіл', 'Дозвольте доступ до фотографій.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleDateValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    setDatePickerVisible(false);
    setBirthDate(selectedDate);
  };

  const handleDateDismiss = () => setDatePickerVisible(false);

  const saveRegistration = async () => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (!firstName.trim() || !lastName.trim() || !birthDate || phoneDigits.length !== 12 || !/^\S+@\S+\.\S+$/.test(email) || !city.trim() || password.length < 6 || !gender || !goal || !consent) {
      Alert.alert('Перевірте форму', 'Заповніть усі поля та підтвердьте згоду.');
      return;
    }

    setIsSaving(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password,
      );
      await createUser(db, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: formatDate(birthDate),
        age: calculateAge(birthDate),
        phone,
        email: normalizedEmail,
        city: city.trim(),
        password: passwordHash,
        password_hash: passwordHash,
        gender,
        registration_goal: goal,
        newsletter_consent: consent ? 1 : 0,
        photo_uri: photoUri,
      });
      const user = await getUserByEmail(db, normalizedEmail);
      if (user) onSaved(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const message = errorMessage.includes('UNIQUE')
        ? 'Користувач із такою електронною поштою вже існує.'
        : `Не вдалося зберегти дані. ${errorMessage}`;
      console.error('Registration save error:', error);
      Alert.alert('Помилка', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Створіть профіль</Text>
        <Text style={styles.subtitle}>Заповніть дані, щоб продовжити.</Text>
        <SectionTitle text="Особисті дані" />
        <FormField label="Ім’я" placeholder="Наприклад: Іван" value={firstName} onChangeText={setFirstName} />
        <FormField label="Прізвище" placeholder="Наприклад: Іванов" value={lastName} onChangeText={setLastName} />
        <Text style={styles.label}>Дата народження</Text>
        <Pressable style={styles.input} onPress={() => setDatePickerVisible(true)}>
          <Text style={birthDate ? styles.inputText : styles.placeholder}>{birthDate ? formatDate(birthDate) : 'Виберіть дату / DD.MM.YYYY'}</Text>
        </Pressable>
        {datePickerVisible && (
          <DateTimePicker
            value={birthDate ?? new Date(2000, 0, 1)}
            mode="date"
            maximumDate={new Date()}
            onValueChange={handleDateValueChange}
            onDismiss={handleDateDismiss}
          />
        )}
        <SectionTitle text="Контактна інформація" />
        <FormField label="Номер телефону" placeholder="+380 (___) ___-__-__" value={phone} onChangeText={handlePhoneChange} keyboardType="phone-pad" />
        <FormField label="Електронна пошта" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Місто проживання" placeholder="Наприклад: Київ" value={city} onChangeText={setCity} />
        <SectionTitle text="Облікові дані та уподобання" />
        <FormField label="Пароль" placeholder="Мінімум 6 символів" value={password} onChangeText={setPassword} secureTextEntry />
        <ChoiceGroup label="Стать" options={genderOptions} value={gender} onChange={setGender} />
        <ChoiceGroup label="Основна мета реєстрації" options={goalOptions} value={goal} onChange={setGoal} />
        <Text style={styles.label}>Фото</Text>
        <Pressable style={styles.photoButton} onPress={pickPhoto}>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : <Text style={styles.photoIcon}>+</Text>}
          <Text style={styles.photoButtonText}>{photoUri ? 'Змінити фото' : 'Додати фото'}</Text>
        </Pressable>
        <Pressable style={styles.checkboxRow} onPress={() => setConsent(!consent)}>
          <View style={[styles.checkbox, consent && styles.checkboxChecked]}>{consent && <Text style={styles.checkmark}>✓</Text>}</View>
          <Text style={styles.checkboxText}>Погоджуюсь із правилами сервісу та обробкою даних</Text>
        </Pressable>
        <Pressable style={[styles.submitButton, isSaving && styles.disabled]} onPress={saveRegistration} disabled={isSaving}>
          <Text style={styles.submitText}>{isSaving ? 'Збереження...' : 'Зареєструватися'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function formatDate(date: Date) {
  return [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()].join('.');
}

function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) age -= 1;
  return age;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    color: '#18212b',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#697482',
    fontSize: 15,
    marginBottom: 22,
    marginTop: 6,
  },
  label: {
    color: '#3e4a57',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#dce1e7',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  inputText: {
    color: '#18212b',
    fontSize: 16,
  },
  placeholder: {
    color: '#89919d',
    fontSize: 16,
  },
  photoButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dce1e7',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 66,
    padding: 10,
  },
  photoIcon: {
    backgroundColor: '#fff0eb',
    borderRadius: 24,
    color: '#e4572e',
    fontSize: 28,
    height: 46,
    lineHeight: 43,
    textAlign: 'center',
    width: 46,
  },
  photoPreview: {
    borderRadius: 24,
    height: 46,
    width: 46,
  },
  photoButtonText: {
    color: '#3e4a57',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 22,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#b5bec8',
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: '#e4572e',
    borderColor: '#e4572e',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  checkboxText: {
    color: '#596573',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 10,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#e4572e',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 26,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
