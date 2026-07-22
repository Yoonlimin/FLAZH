import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FlipCard({ word, description, imageUrl, forceFlip }) {
    const flipAnim = useRef(new Animated.Value(0)).current;
    const [isFlipped, setIsFlipped] = useState(false);

    // If the parent component wants to force the card to flip (e.g., when picking an image)
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
            {/* Front Side (Text) */}
            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                <Text style={[styles.word, !word && styles.dimText]}>
                    {word || "先生"}
                </Text>
                <Text style={[styles.description, !description && styles.dimText]}>
                    {description || "Teacher"}
                </Text>
                <Ionicons name="sync-outline" size={20} color="#A0AEC0" style={styles.flipIcon} />
            </Animated.View>

            {/* Back Side (Image) */}
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.imageFull} />
                ) : (
                    <View style={styles.placeholderFull}>
                        <Ionicons name="image-outline" size={40} color="#A0AEC0" />
                        <Text style={styles.placeholderText}>Image Side</Text>
                    </View>
                )}
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
    cardFront: { backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
    cardBack: { backgroundColor: '#E2E8F0', overflow: 'hidden' },
    word: { fontFamily: 'Raleway_700Bold', fontSize: 28, color: '#0A2540', marginBottom: 8, textAlign: 'center' },
    description: { fontFamily: 'Raleway_500Medium', fontSize: 16, color: '#4A5D78', textAlign: 'center' },
    dimText: { color: '#A0AEC0', opacity: 0.6 },
    flipIcon: { position: 'absolute', bottom: 12, right: 16, opacity: 0.5 },
    imageFull: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    placeholderFull: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontFamily: 'Raleway_500Medium', fontSize: 14, color: '#A0AEC0', marginTop: 8 },
});