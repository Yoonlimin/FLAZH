import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';

// Required for Expo auth session to work correctly in the browser/app
WebBrowser.maybeCompleteAuthSession();

export default function SignUp({ onBack, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Set up Google Auth Hook requesting ID Token for backend verification
  const [request, response, promptAsync] = Google.useAuthRequest({
    responseType: ResponseType.IdToken,
    webClientId: '132164771913-7bve9c4tf8vqslu2f1sph2bf1ropjvp7.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  });

  // Listen for the Google login response
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token || response.authentication?.idToken;

      if (idToken) {
        handleGoogleAuth(idToken);
      } else {
        Alert.alert("Notice", "No ID token received from Google.");
      }
    }
  }, [response]);

  const handleGoogleAuth = async (idToken) => {
    try {
      // Send the Google ID token to your backend
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        onAuthSuccess(data.user, data.isNewUser);
      } else {
        Alert.alert("Notice", data.error || "Google Authentication failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the backend server.");
    }
  };

  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        onAuthSuccess(data.user, data.isNewUser);
      } else {
        Alert.alert("Notice", data.error || "Authentication failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the backend server. Double check your IP address!");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.innerContainer}>

        <View style={styles.headerBar}>
          <Pressable onPress={onBack}>
            <Image source={require('../assets/logo.png')} style={styles.smallLogo} resizeMode="contain" />
          </Pressable>
        </View>

        <Text style={[styles.logoText, { marginTop: 40, textAlign: 'center' }]}>FLAZH</Text>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Welcome</Text>
          <Text style={styles.formSubtitle}>Enter your email to Jump into Flazh</Text>

          <TextInput
            style={styles.inputField}
            placeholder="email@domain.com"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.inputField}
            placeholder="password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={true}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.dividerBlock}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.8}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Image source={require('../assets/google.jpg')} style={{ width: 20, height: 20, marginRight: 10 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.legalNotice}>
            By clicking continue, you agree to our <Text style={styles.legalLink}>Terms of Service</Text> and <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  innerContainer: { flex: 1, width: '100%' },
  headerBar: { width: '100%', paddingHorizontal: 24, paddingTop: 10, alignItems: 'flex-start' },
  smallLogo: { width: 100, height: 60, marginLeft: -20 },
  logoText: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', letterSpacing: 1.5 },
  formContainer: { width: '100%', paddingHorizontal: 24, alignItems: 'center', marginTop: 30 },
  formTitle: { fontFamily: 'Raleway_700Bold', fontSize: 20, color: '#1A202C', marginBottom: 6 },
  formSubtitle: { fontFamily: 'Raleway_500Medium', fontSize: 14, color: '#718096', marginBottom: 24 },
  inputField: { width: '100%', height: 54, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 16, fontFamily: 'Raleway_500Medium', fontSize: 16, color: '#2D3748', marginBottom: 16, backgroundColor: '#FAFAFA' },
  button: { backgroundColor: '#0F294A', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 18 },
  dividerBlock: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontFamily: 'Raleway_500Medium', color: '#A0AEC0', paddingHorizontal: 12, fontSize: 14 },
  googleButton: { width: '100%', paddingVertical: 16, borderRadius: 12, backgroundColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  googleIcon: { width: 20, height: 20, marginRight: 12 },
  googleButtonText: { fontFamily: 'Raleway_600SemiBold', color: '#2D3748', fontSize: 16 },
  legalNotice: { fontFamily: 'Raleway_500Medium', fontSize: 12, color: '#718096', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  legalLink: { fontFamily: 'Raleway_600SemiBold', color: '#4A5568' }
});