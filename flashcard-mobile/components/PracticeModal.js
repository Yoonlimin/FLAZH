import React, { useState, useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PracticeModal({ visible, words, onClose }) {
  const [activeDeck, setActiveDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // ✨ The Animation Engine
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Initialize deck and reset flip
  useEffect(() => {
    if (visible && words && words.length > 0) {
      setActiveDeck(words);
      setCurrentIndex(0);
    }
  }, [visible, words]);

  // ✨ Reset the flip instantly when switching cards
  useEffect(() => {
    flipAnim.setValue(0);
    setIsFlipped(false);
  }, [currentIndex, visible]);

  if (!activeDeck || activeDeck.length === 0) return null;
  const currentCard = activeDeck[currentIndex];

  // ✨ The 3D Flip Function
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Interpolations for the front and back rotations
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleShuffle = () => {
    let shuffled = [...activeDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setActiveDeck(shuffled);
    setCurrentIndex(0);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.counterText}>{currentIndex + 1} / {activeDeck.length}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#0A2540" />
          </TouchableOpacity>
        </View>

        {/* The Big Flashcard Container */}
        <View style={styles.cardContainer}>
          <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardWrapper}>
            
            {/* ✨ FRONT OF CARD (Photo OR Meaning) */}
            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
              <View style={styles.cardContent}>
                
                {currentCard.image_url ? (
                  // SCENARIO 1: There is an image
                  <Image source={{ uri: currentCard.image_url }} style={styles.cardImage} />
                ) : (
                  // ✨ SCENARIO 2: No image! Show the Meaning instead.
                  <View style={styles.textOnlyFront}>
                    {currentCard.meaning ? (
                      <Text style={styles.meaningTextOnly}>{currentCard.meaning}</Text>
                    ) : (
                      <Text style={styles.noMeaningText}>No meaning added</Text>
                    )}
                  </View>
                )}
                
                <Text style={styles.tapPrompt}>Tap to reveal word</Text>
              </View>
            </Animated.View>

            {/* ✨ BACK OF CARD (Word & Description) */}
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
              <View style={styles.cardContent}>
                <Text style={styles.cardWord}>{currentCard.word}</Text>
                {/* Only render description if it exists */}
                {currentCard.description ? (
                  <Text style={styles.cardDescription}>{currentCard.description}</Text>
                ) : null}
                <Text style={styles.tapPrompt}>Tap to see prompt</Text>
              </View>
            </Animated.View>

          </TouchableOpacity>
        </View>

        {/* Bottom Navigation Controls */}
        <View style={styles.navContainer}>
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]} 
            onPress={handlePrev} disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? "#A0AEC0" : "#FFFFFF"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle} activeOpacity={0.7}>
            <Ionicons name="shuffle" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, currentIndex === activeDeck.length - 1 && styles.navButtonDisabled]} 
            onPress={handleNext} disabled={currentIndex === activeDeck.length - 1}
          >
            <Ionicons name="chevron-forward" size={24} color={currentIndex === activeDeck.length - 1 ? "#A0AEC0" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E2E8F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  counterText: { fontFamily: 'Raleway_600SemiBold', fontSize: 16, color: '#4A5568' },
  closeButton: { padding: 4 },
  
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  
  // Animation Wrapper Styles
  cardWrapper: {
    width: '100%',
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute', 
    backfaceVisibility: 'hidden', 
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    padding: 24,
  },
  cardFront: { zIndex: 1 }, 
  cardBack: { zIndex: 0 },
  
  cardContent: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: '100%', height: '80%', resizeMode: 'contain', marginBottom: 20 },
  
  // ✨ New Text-Only Styles for the Front
  textOnlyFront: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 10, marginBottom: 20 },
  meaningTextOnly: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', textAlign: 'center' },
  noMeaningText: { fontFamily: 'Raleway_500Medium', fontSize: 18, color: '#A0AEC0', textAlign: 'center', fontStyle: 'italic' },
  
  cardWord: { fontFamily: 'Raleway_700Bold', fontSize: 42, color: '#0A2540', textAlign: 'center', marginBottom: 12 },
  cardDescription: { fontFamily: 'Raleway_500Medium', fontSize: 24, color: '#4A5568', textAlign: 'center', marginBottom: 20 },
  tapPrompt: { position: 'absolute', bottom: 10, fontFamily: 'Raleway_500Medium', fontSize: 14, color: '#A0AEC0' },
  
  navContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 40, gap: 24 },
  navButton: { backgroundColor: '#0A2540', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  navButtonDisabled: { backgroundColor: '#CBD5E0' },
  shuffleButton: { backgroundColor: '#38BDF8', width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});