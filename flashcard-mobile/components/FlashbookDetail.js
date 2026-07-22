import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddWordModal from './AddWordModal';

export default function FlashbookDetail({ deck, onBack }) {
  // 📝 Temporary state for words (empty by default to show the new blank state!)
  const [words, setWords] = useState([]);
  const [addWordVisible, setAddWordVisible] = useState(false);

  return (
    <View style={styles.innerContainer}>

      {/* Title Header Bar with Inline Back Arrow */}
      <View style={styles.titleHeaderBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={28} color="#0A2540" />
        </TouchableOpacity>

        <Text style={styles.logoText}>FLAZH</Text>
      </View>

      <Text style={styles.screenSubtitle}>{deck.title}</Text>

      {/* Word List Area */}
      <View style={styles.wordsListContainer}>
        {words.length === 0 ? (
          /* ✨ EMPTY STATE (Shows when 0 words exist) */
          <View style={styles.emptyWordsContainer}>
            <Ionicons name="book-outline" size={48} color="#A0AEC0" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyWordsTitle}>No words yet</Text>
            <Text style={styles.emptyWordsSub}>Tap "Add words" below to create your first flashcard!</Text>
          </View>
        ) : (
          /* 📝 LIST STATE (Shows when words are added) */
          <ScrollView showsVerticalScrollIndicator={false}>
            {words.map((item, index) => (
              <View key={index} style={styles.wordRow}>
                <Text style={styles.wordText}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Bottom Navigation Switcher */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setAddWordVisible(true)}>
          <Text style={styles.tabText}>Add words</Text>
        </TouchableOpacity>
        <View style={styles.tabDivider} />
        <TouchableOpacity style={styles.tabButton}>
          <Text style={[styles.tabText, styles.activeTabText]}>Practice</Text>
        </TouchableOpacity>

        <AddWordModal
          visible={addWordVisible}
          onClose={() => setAddWordVisible(false)}
          onSave={async (newCard) => {
            try {
              // ⚠️ IMPORTANT: Replace '192.168.x.x' with your actual computer's local IP address!
              const response = await fetch(`http://192.168.101.222:5000/api/flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  flashbook_id: deck.id, // Assuming 'deck.id' is the current Flashbook's ID
                  word: newCard.word,
                  description: newCard.description,
                  image_url: newCard.image
                }),
              });

              if (response.ok) {
                const savedCard = await response.json();

                // Add the newly saved card to your local React state so it shows up instantly!
                // (Assuming you have a state like: const [words, setWords] = useState([]))
                setWords(prevWords => [...prevWords, savedCard]);

                console.log("Card saved successfully:", savedCard);
              } else {
                console.error("Failed to save card");
              }
            } catch (error) {
              console.error("Error saving flashcard:", error);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF'
  },
  titleHeaderBar: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 12,
    zIndex: 10,
  },
  logoText: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 36,
    color: '#0A2540',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 18,
    color: '#1A202C',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  wordsListContainer: {
    flex: 1,
    paddingHorizontal: 24
  },
  /* ✨ New Empty State Styles */
  emptyWordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40, // Pulls it slightly up so it feels perfectly centered
  },
  emptyWordsTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyWordsSub: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
  },
  /* 📝 List Styles */
  wordRow: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10
  },
  wordText: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 16,
    color: '#2D3748'
  },
  bottomTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingBottom: 24
  },
  tabButton: {
    flex: 1,
    alignItems: 'center'
  },
  tabDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0'
  },
  tabText: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 15,
    color: '#A0AEC0'
  },
  activeTabText: {
    fontFamily: 'Raleway_700Bold',
    color: '#0A2540'
  },
});