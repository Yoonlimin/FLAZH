import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FlazhLogo() {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoDark}>FLA</Text>
      
      {/* The 'Z' gets its own wrapper so we can attach butterflies to it */}
      <View style={styles.zContainer}>
        <Text style={styles.logoLight}>Z</Text>
        
        {/* Absolutely positioned butterflies floating off the top right */}
        <MaterialCommunityIcons name="bluetooth" size={14} color="#0A2540" style={styles.butterfly1} />
        <MaterialCommunityIcons name="butterfly" size={9}  color="#cc91c1" style={styles.butterfly2} />
        <MaterialCommunityIcons name="butterfly" size={12} color="#0A2540" style={styles.butterfly3} />
      </View>

      <Text style={styles.logoDark}>H</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoDark: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', letterSpacing: 1.5 },
  logoLight: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#7486a0', letterSpacing: 1.5 },
  zContainer: { position: 'relative' },
  
  /* Butterfly Positioning */
  butterfly1: { position: 'absolute', top: 7, right: -2, transform: [{ rotate: '15deg' }] },
  butterfly2: { position: 'absolute', top: -8, right: 4, transform: [{ rotate: '-25deg' }] },
  butterfly3: { position: 'absolute', top: 17, right: 5, transform: [{ rotate: '45deg' }] },
});