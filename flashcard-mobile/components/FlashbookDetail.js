import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddWordModal from './AddWordModal';
import PracticeModal from './PracticeModal'; // 🆕 Imported
import EditWordScreen from './EditWordScreen'; // 🆕 Imported

export default function FlashbookDetail({ deck, onBack }) {
  
  const [words, setWords] = useState([]);
  const [addWordVisible, setAddWordVisible] = useState(false);
  
  // 🆕 New state for our modals
  const [practiceVisible, setPracticeVisible] = useState(false);
  const [editingWord, setEditingWord] = useState(null); 

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashcards/${deck.id}`);
        if (response.ok) {
          const data = await response.json();
          setWords(data);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };
    fetchCards();
  }, [deck.id]);

  // 🆕 Function to handle saving an edited word
  const handleEditSave = async (updatedCard) => {
    // Note: You will need a PUT route in your backend for this to work!
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashcards/${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      });
      if (response.ok) {
        setWords(words.map(w => w.id === updatedCard.id ? updatedCard : w));
        setEditingWord(null);
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  // 🆕 Function to handle deleting a word
  const handleDelete = async (id) => {
    // Note: You will need a DELETE route in your backend for this to work!
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashcards/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWords(words.filter(w => w.id !== id));
        setEditingWord(null);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };


  if (editingWord) {
    return (
      <EditWordScreen 
        wordData={editingWord} 
        onBack={() => setEditingWord(null)} // Clicking back simply returns to the list
        onSave={handleEditSave}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <SafeAreaView style={styles.innerContainer}>
      <View style={styles.titleHeaderBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color="#0A2540" />
        </TouchableOpacity>
        <Text style={styles.logoText}>FLAZH</Text>
      </View>

      <Text style={styles.screenSubtitle}>{deck.title}</Text>

      <View style={styles.wordsListContainer}>
        {words.length === 0 ? (
          <View style={styles.emptyWordsContainer}>
            <Ionicons name="book-outline" size={48} color="#A0AEC0" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyWordsTitle}>No words yet</Text>
            <Text style={styles.emptyWordsSub}>Tap "Add words" below to create your first flashcard!</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {words.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.wordRow}
                activeOpacity={0.7}
                onPress={() => setEditingWord(item)} // 🆕 Opens Edit Modal
              >
                <Text style={styles.wordText}>{item.word}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setAddWordVisible(true)}>
          <Text style={styles.tabText}>Add words</Text>
        </TouchableOpacity>
        <View style={styles.tabDivider} />
        
        {/* 🆕 Triggers the Practice Modal! */}
        <TouchableOpacity style={styles.tabButton} onPress={() => {
          if(words.length === 0) Alert.alert("No words", "Add some words before practicing!");
          else setPracticeVisible(true);
        }}>
          <Text style={[styles.tabText, styles.activeTabText]}>Practice</Text>
        </TouchableOpacity>
      </View>

      {/* --- ALL MODALS DOWN HERE --- */}
      <AddWordModal
        visible={addWordVisible}
        onClose={() => setAddWordVisible(false)}
        onSave={async (newCard) => {
          try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashcards`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                flashbook_id: deck.id,
                word: newCard.word,
                description: newCard.description,
                image_url: newCard.image
              }),
            });
            if (response.ok) {
              const savedCard = await response.json();
              setWords(prevWords => [...prevWords, savedCard]);
            }
          } catch (error) {
            console.error("Error saving flashcard:", error);
          }
        }}
      />

      <PracticeModal 
        visible={practiceVisible} 
        words={words} 
        onClose={() => setPracticeVisible(false)} 
      />

    </SafeAreaView>
  );
}

// Ensure you keep your existing styles at the bottom exactly as they were!
const styles = StyleSheet.create({
  innerContainer: { flex: 1, width: '100%', backgroundColor: '#FFFFFF' },
  titleHeaderBar: { width: '100%', paddingHorizontal: 24, paddingTop: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 20, bottom: 12, zIndex: 10 },
  logoText: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', letterSpacing: 1.5, textAlign: 'center' },
  screenSubtitle: { fontFamily: 'Raleway_500Medium', fontSize: 18, color: '#1A202C', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  wordsListContainer: { flex: 1, paddingHorizontal: 24 },
  emptyWordsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, marginTop: -40 },
  emptyWordsTitle: { fontFamily: 'Raleway_700Bold', fontSize: 20, color: '#2D3748', marginBottom: 8 },
  emptyWordsSub: { fontFamily: 'Raleway_500Medium', fontSize: 14, color: '#A0AEC0', textAlign: 'center', lineHeight: 20 },
  wordRow: { backgroundColor: '#FAFAFA', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10 },
  wordText: { fontFamily: 'Raleway_500Medium', fontSize: 16, color: '#2D3748' },
  bottomTabBar: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#E2E8F0', paddingVertical: 16, paddingBottom: 24 },
  tabButton: { flex: 1, alignItems: 'center' },
  tabDivider: { width: 1, height: '100%', backgroundColor: '#E2E8F0' },
  tabText: { fontFamily: 'Raleway_500Medium', fontSize: 15, color: '#A0AEC0' },
  activeTabText: { fontFamily: 'Raleway_700Bold', color: '#0A2540' },
});