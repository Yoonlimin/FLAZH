import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Modal, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateFlashbookModal({ visible, onClose, onSave }) {
  const [newTitle, setNewTitle] = useState('');
  const [deckType, setDeckType] = useState('picture'); // ✨ NEW: State for deck type

  const handleSave = () => {
    if (!newTitle.trim()) return;
    onSave(newTitle.trim(), deckType); // ✨ Pass the deckType up to Dashboard
    setNewTitle('');
    setDeckType('picture'); // Reset to default
  };

  const handleClose = () => {
    setNewTitle('');
    setDeckType('picture');
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* ❌ Close Cross Button Locked to Upper Right */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Flashbook Name</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter name here.."
                placeholderTextColor="#A0AEC0"
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus={true}
              />
            </View>

            {/* ✨ NEW: Deck Type Selection UI */}
            <View style={styles.selectionContainer}>
              <TouchableOpacity 
                style={[styles.typeCard, deckType === 'picture' && styles.typeCardSelected]}
                onPress={() => setDeckType('picture')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, deckType === 'picture' && styles.iconBoxSelected]}>
                  <Ionicons name="image" size={20} color={deckType === 'picture' ? "#0A2540" : "#A0AEC0"} />
                </View>
                <View style={styles.typeTextContainer}>
                  <Text style={[styles.typeTitle, deckType === 'picture' && styles.typeTitleSelected]}>Picture Deck</Text>
                  <Text style={styles.typeDesc}>Visual memory & images</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeCard, deckType === 'simple' && styles.typeCardSelected]}
                onPress={() => setDeckType('simple')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, deckType === 'simple' && styles.iconBoxSelected]}>
                  <Ionicons name="text" size={20} color={deckType === 'simple' ? "#0A2540" : "#A0AEC0"} />
                </View>
                <View style={styles.typeTextContainer}>
                  <Text style={[styles.typeTitle, deckType === 'simple' && styles.typeTitleSelected]}>Simple Deck</Text>
                  <Text style={styles.typeDesc}>Text-only flashcards</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save Flashbook</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 24,
  },
  modalContent: { 
    width: '100%', 
    backgroundColor: '#4A5D78', 
    borderRadius: 16, 
    paddingHorizontal: 30,
    paddingBottom: 24,
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 14,
    alignSelf: 'flex-end',
    zIndex: 10,
    padding: 4,
  },
  modalTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    bottom: 13,
  },
  inputContainer: { 
    width: '100%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    marginBottom: 20 
  },
  modalInput: { 
    fontFamily: 'Raleway_500Medium', 
    fontSize: 16, 
    color: '#2D3748' 
  },
  
  // ✨ Type Selection Styles
  selectionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    backgroundColor: '#0F294A',
    borderColor: '#38BDF8',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: '#38BDF8',
  },
  typeTextContainer: {
    flex: 1,
  },
  typeTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    color: '#A0AEC0',
  },
  typeTitleSelected: {
    color: '#FFFFFF',
  },
  typeDesc: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },

  saveButton: { 
    width: '100%', 
    backgroundColor: '#0F294A', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  saveButtonText: { 
    fontFamily: 'Raleway_700Bold', 
    color: '#FFFFFF', 
    fontSize: 16 
  },
});