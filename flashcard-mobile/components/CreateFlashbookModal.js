import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateFlashbookModal({ visible, onClose, onSave }) {
  const [newTitle, setNewTitle] = useState('');
  const [deckType, setDeckType] = useState('picture');

  const handleSave = () => {
    if (!newTitle.trim()) return;
    onSave(newTitle.trim(), deckType);
    setNewTitle('');
    setDeckType('picture');
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
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        {/* Stop propagation so clicking inside the modal doesn't close it */}
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>

          {/* Floating Circle Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
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
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Type Selection */}
          <View style={styles.selectionContainer}>
            <TouchableOpacity
              style={[styles.typeCard, deckType === 'picture' && styles.typeCardSelected]}
              onPress={() => setDeckType('picture')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, deckType === 'picture' && styles.iconBoxSelected]}>
                <Ionicons
                  name="image"
                  size={20}
                  color={deckType === 'picture' ? "#FFFFFF" : "#A0AEC0"}
                />
              </View>
              <View style={styles.typeTextContainer}>
                <Text style={[styles.typeTitle, deckType === 'picture' && styles.typeTitleSelected]}>
                  Picture Deck
                </Text>
                <Text style={styles.typeDesc}>Visual memory & images</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeCard, deckType === 'simple' && styles.typeCardSelected]}
              onPress={() => setDeckType('simple')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, deckType === 'simple' && styles.iconBoxSelected]}>
                <Ionicons
                  name="text"
                  size={20}
                  color={deckType === 'simple' ? "#FFFFFF" : "#A0AEC0"}
                />
              </View>
              <View style={styles.typeTextContainer}>
                <Text style={[styles.typeTitle, deckType === 'simple' && styles.typeTitleSelected]}>
                  Simple Deck
                </Text>
                <Text style={styles.typeDesc}>Text-only flashcards</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Save Flashbook</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#4A5D78',
    borderRadius: 20,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#0F294A',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#4A5D78',
  },
  modalTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  modalInput: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 16,
    color: '#2D3748',
    width: '100%',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },
  selectionContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
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
    marginRight: 14,
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
    color: '#CBD5E1',
  },
  typeTitleSelected: {
    color: '#FFFFFF',
  },
  typeDesc: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#0F294A',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
});