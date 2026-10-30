import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import FadeUpView from './effects/FadeUpView';

export default function WelcomePage({ onGetStarted }) {
  return (
    <View style={styles.innerContainer}>
      <View style={styles.topSpacer} />
      <FadeUpView duration={1000}>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Text style={styles.logoText}>FLAZH</Text>
          <Text style={styles.taglineText}>Your Secret Study Weapon</Text>
        </View>

        {/* Central Illustration Layer */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Interactive Bottom Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onGetStarted} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

      </FadeUpView>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  topSpacer: {
    height: 110,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoText: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A2540',
    letterSpacing: 1.5,
  },
  taglineText: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 14,
    color: '#4F5E71',
    marginTop: 10,
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  illustration: {
    width: 500,
    height: 300,
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '55%',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0F294A',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});