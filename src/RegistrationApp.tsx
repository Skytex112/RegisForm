import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { migrateDbIfNeeded } from './database/database';
import { ProfileScreen } from './screens/ProfileScreen';
import { RegistrationForm } from './screens/RegistrationForm';
import { type UserRecord } from './types/user';

type Screen = 'form' | 'profile';

export default function RegistrationApp() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="registration.db" onInit={migrateDbIfNeeded}>
        <RegistrationScreens />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

function RegistrationScreens() {
  const [screen, setScreen] = useState<Screen>('form');
  const [savedUser, setSavedUser] = useState<UserRecord | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {screen === 'form' ? (
        <RegistrationForm
          onSaved={(user) => {
            setSavedUser(user);
            setScreen('profile');
          }}
        />
      ) : (
        <ProfileScreen user={savedUser} onBack={() => setScreen('form')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f7f8fa',
    flex: 1,
  },
});
