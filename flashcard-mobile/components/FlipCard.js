import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FlipCard({ word, description, meaning, imageUrl, forceFlip }) {
    const flipAnim = useRef(new Animated.Value(0)).current;
    const [isFlipped, setIsFlipped] = useState(false);

    // If the parent component wants to force the card to flip
    useEffect(() => {
        if (forceFlip && !isFlipped) {
            flipCard();
        }
    }, [forceFlip]);

    const flipCard = () => {
        Animated.timing(flipAnim, {
            toValue: isFlipped ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setIsFlipped(!isFlipped);
    };

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

    return (
        <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.container}>
            
            {/* 🟢 Front Side (Target Word) */}
            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                <Text style={[styles.word, !word && styles.dimText]}>
                    {word || "Word"}
                </Text>
                <Text style={[styles.description, !description && styles.dimText]}>
                    {description || "Pronunciation (Optional)"}
                </Text>
                <Ionicons name="sync-outline" size={20} color="#A0AEC0" style={styles.flipIcon} />
            </Animated.View>

            {/* 🔴 Back Side (Image and/or Meaning) */}
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                
                {imageUrl ? (
                    // SCENARIO 1: We have an image
                    <>
                        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                        {meaning ? (
                            <View style={styles.meaningOverlay}>
                                <Text style={styles.meaningOverlayText}>{meaning}</Text>
                            </View>
                        ) : null}
                    </>
                ) : (
                    // ✨ SCENARIO 2: No image, focus ONLY on the meaning!
                    <View style={styles.textOnlyBack}>
                        {meaning ? (
                            <Text style={styles.meaningTextOnly}>{meaning}</Text>
                        ) : (
                            <Text style={styles.noMeaningText}>Meaning</Text>
                        )}
                    </View>
                )}

                {/* Flip icon adjusts color so it's visible on dark images */}
                <Ionicons 
                    name="sync-outline" 
                    size={20} 
                    color={imageUrl && !meaning ? "rgba(255,255,255,0.7)" : "#A0AEC0"} 
                    style={styles.flipIcon} 
                />
            </Animated.View>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 180,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backfaceVisibility: 'hidden',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardFront: { 
        backgroundColor: '#F8FAFC', 
        paddingHorizontal: 20 
    },
    cardBack: { 
        backgroundColor: '#E2E8F0', 
        overflow: 'hidden'
    },
    
    // Front Text Styles
    word: { fontFamily: 'Raleway_700Bold', fontSize: 28, color: '#0A2540', marginBottom: 8, textAlign: 'center' },
    description: { fontFamily: 'Raleway_500Medium', fontSize: 16, color: '#4A5D78', textAlign: 'center' },
    dimText: { color: '#A0AEC0', opacity: 0.6 },
    
    // Back Image Styles
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        position: 'absolute',
    },
    
    // Back Text Styles (When there is an image)
    meaningOverlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(10, 37, 64, 0.75)', 
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    meaningOverlayText: {
        fontFamily: 'Raleway_700Bold',
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
    },

    // Back Text Styles (When there is NO image)
    textOnlyBack: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
    },
    meaningTextOnly: {
        fontFamily: 'Raleway_700Bold',
        fontSize: 26,
        color: '#0A2540',
        textAlign: 'center',
    },
    
    // ✨ Updated fallback text style
    noMeaningText: {
        fontFamily: 'Raleway_500Medium',
        fontSize: 16,
        color: '#A0AEC0',
        textAlign: 'center',
        fontStyle: 'italic',
    },

    flipIcon: { position: 'absolute', bottom: 12, right: 16 },
});