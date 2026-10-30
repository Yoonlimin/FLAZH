import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Raleway_700Bold, Raleway_500Medium, Raleway_600SemiBold } from '@expo-google-fonts/raleway';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomePage from './components/WelcomePage';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [user, setUser] = useState(null);

  let [fontsLoaded] = useFonts({
    Raleway_700Bold,
    Raleway_500Medium,
    Raleway_600SemiBold
  });

  // Check saved session on launch
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('userData');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setCurrentScreen('dashboard'); // Returning user goes straight home!
        } else {
          setCurrentScreen('welcome');
        }
      } catch (error) {
        setCurrentScreen('welcome');
      }
    };

    if (fontsLoaded) {
      checkLoginStatus();
    }
  }, [fontsLoaded]);

  // 🚀 THIS IS THE TRIGGER THAT NAVIGATION DEPENDS ON:
  const handleAuthSuccess = async (userData, isNewUser) => {
    try {
      // 1. Save user to phone memory so they stay logged in
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);

      // 2. FORCE SCREEN STATE CHANGE TO DASHBOARD!
      setCurrentScreen('dashboard');
    } catch (e) {
      console.log("Error storing user session", e);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    setUser(null);
    setCurrentScreen('welcome');
  };

  if (!fontsLoaded || currentScreen === 'loading') return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {currentScreen === 'welcome' && (
          <WelcomePage onGetStarted={() => setCurrentScreen('signup')} />
        )}

        {currentScreen === 'signup' && (
          <SignUp
            onBack={() => setCurrentScreen('welcome')}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {currentScreen === 'dashboard' && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});