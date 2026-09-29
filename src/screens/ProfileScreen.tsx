import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type UserRecord } from '../types/user';

export function ProfileScreen({ user, onBack }: { user: UserRecord | null; onBack: () => void }) {
  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={onBack}><Text style={styles.backButton}>‹ Назад до форми</Text></Pressable>
      <Text style={styles.eyebrow}>SAVED PROFILE</Text>
      <Text style={styles.title}>Дані збережено</Text>
      {user.photo_uri && <Image source={{ uri: user.photo_uri }} style={styles.profilePhoto} />}
      <View style={styles.profileCard}>
        <ProfileRow label="Ім’я та прізвище" value={`${user.first_name} ${user.last_name}`} />
        <ProfileRow label="Дата народження" value={user.birth_date} />
        <ProfileRow label="Телефон" value={user.phone} />
        <ProfileRow label="Email" value={user.email} />
        <ProfileRow label="Місто" value={user.city} />
        <ProfileRow label="Стать" value={user.gender} />
        <ProfileRow label="Мета реєстрації" value={user.registration_goal} />
        <ProfileRow label="Згода на розсилку та умови" value={user.newsletter_consent ? 'Погоджено' : 'Не погоджено'} />
      </View>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.profileRow}><Text style={styles.profileLabel}>{label}</Text><Text style={styles.profileValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  eyebrow: {
    color: '#e4572e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginTop: 20,
  },
  title: {
    color: '#18212b',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  backButton: {
    color: '#e4572e',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  profilePhoto: {
    alignSelf: 'center',
    borderRadius: 56,
    height: 112,
    marginVertical: 22,
    width: 112,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 24,
    padding: 18,
  },
  profileRow: {
    borderBottomColor: '#edf0f2',
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  profileLabel: {
    color: '#89919d',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileValue: {
    color: '#18212b',
    fontSize: 16,
    fontWeight: '600',
  },
});
