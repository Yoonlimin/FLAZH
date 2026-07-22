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

  const handleSave = () => {
    if (!newTitle.trim()) return;
    onSave(newTitle.trim());
    setNewTitle('');
  };

  const handleClose = () => {
    setNewTitle('');
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save</Text>
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
    minHeight: 280,
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
    alignSelf: 'flex-end', // 👈 Overrides flex centering to pin strictly right!
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