import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function FadeUpView({ children, duration = 1000 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset to completely invisible before starting
    fadeAnim.setValue(0);

    // Run only the opacity animation (no movement)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration, 
      useNativeDriver: true, // Super smooth 60fps execution
    }).start();
  }, [duration]); 

  return (
    <Animated.View style={{ 
      flex: 1, 
      width: '100%', 
      alignItems: 'center', 
      opacity: fadeAnim, // 👈 Pure fade constraint
    }}>
      {children}
    </Animated.View>
  );
}