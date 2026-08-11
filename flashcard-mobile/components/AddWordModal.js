import React, { useState } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, Text, Modal, 
  TouchableWithoutFeedback, Keyboard, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// 1️⃣ Import your new reusable component!
import FlipCard from './FlipCard'; 

// 🔑 NOTE: Replace this with your free Pexels API Key
const PEXELS_API_KEY = 'rA5VqQSI1v4mpdF5QeVX56bpsQ1DE4BkIIyjQHFDVtk35PecRZILieDH';

export default function AddWordModal({ visible, onClose, onSave }) {
  const [word, setWord] = useState('');
  const [description, setDescription] = useState('');
  
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forceFlip, setForceFlip] = useState(false);

  // Toggle for manual search / upload
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [imageKeyword, setImageKeyword] = useState('');

  // ✨ AUTO-FETCH: Runs when the user finishes typing the word (onBlur)
  const handleAutoFetchImage = async () => {
    if (!word.trim()) return;
    fetchPexels(word.trim());
  };

  // ✨ MANUAL SEARCH: Runs when user types a specific keyword
  const handleManualSearch = () => {
    if (!imageKeyword.trim()) return;
    Keyboard.dismiss();
    fetchPexels(imageKeyword.trim());
  };

  // 🌐 The actual Pexels API call
  const fetchPexels = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=10`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        const photoUrls = data.photos.map(photo => photo.src.medium);
        setImages(photoUrls);
        
        // Auto-select the first image to make it feel like magic!
        handleSelectImage(photoUrls[0]);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
    setLoading(false);
  };

  // 📸 MANUAL UPLOAD: Expo Image Picker
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleSelectImage(result.assets[0].uri);
    }
  };

  const handleSelectImage = (imgUrl) => {
    setSelectedImage(imgUrl);
    setForceFlip(prev => !prev); // Tells the child FlipCard to show the image side
  };

  const handleSave = () => {
    if (!word.trim()) return;
    onSave({ word: word.trim(), description: description.trim(), image: selectedImage });
    handleClose();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setWord(''); setDescription(''); setImageKeyword('');
    setImages([]); setSelectedImage(null); setShowAdvancedOptions(false);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      {/* ✨ Back to a regular View! */}
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Note: The close button stays OUTSIDE the ScrollView so it's always pinned to the top right! */}
              <TouchableOpacity style={styles.closeButton} onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* ✨ 2. Added ScrollView right here for the inside of the box */}
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                <Text style={styles.modalTitle}>Create Flashcard</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Target word or phrase..."
                    placeholderTextColor="#A0AEC0"
                    value={word}
                    onChangeText={setWord}
                    onBlur={handleAutoFetchImage} 
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Description / Pronunciation (Optional)"
                    placeholderTextColor="#A0AEC0"
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <FlipCard 
                  word={word} 
                  description={description} 
                  imageUrl={selectedImage} 
                  forceFlip={forceFlip} 
                />

                {loading && !showAdvancedOptions && (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginBottom: 20 }} />
                )}

                <TouchableOpacity 
                  style={styles.advancedOptionsToggle} 
                  onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  <Text style={styles.advancedOptionsText}>
                    {showAdvancedOptions ? "Hide Image Options" : "Don't like the auto-image? Change it"}
                  </Text>
                </TouchableOpacity>

                {showAdvancedOptions && (
                  <View style={styles.advancedOptionsContainer}>
                    <View style={styles.searchRow}>
                      <View style={[styles.inputContainer, { flex: 1, marginBottom: 0, marginRight: 10, paddingVertical: 10 }]}>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="Search new keyword..."
                          placeholderTextColor="#A0AEC0"
                          value={imageKeyword}
                          onChangeText={setImageKeyword}
                          onSubmitEditing={handleManualSearch}
                        />
                      </View>
                      <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
                        <Ionicons name="image" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.iconButton, { marginLeft: 8 }]} onPress={handleManualSearch}>
                        <Ionicons name="search" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.galleryContainer}>
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : images.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                          {images.map((imgUrl, index) => (
                            <TouchableOpacity key={index} onPress={() => handleSelectImage(imgUrl)}>
                              <Image 
                                source={{ uri: imgUrl }} 
                                style={[styles.thumbnail, selectedImage === imgUrl && styles.thumbnailSelected]} 
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : (
                        <Text style={styles.galleryHint}>No images found.</Text>
                      )}
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                  <Text style={styles.saveButtonText}>Add to Flashbook</Text>
                </TouchableOpacity>
              
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  modalContent: { 
    width: '100%', 
    backgroundColor: '#4A5D78', 
    borderRadius: 24, 
    paddingHorizontal: 24, 
    paddingBottom: 30, 
    paddingTop: 24,
    // ✨ 3. Added maxHeight so the box doesn't stretch off the screen!
    maxHeight: '85%', 
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10,
  },
  
  closeButton: { position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 4 },
  modalTitle: { fontFamily: 'Raleway_700Bold', fontSize: 20, color: '#FFFFFF', textAlign: 'center', marginBottom: 20, marginTop: 10 },
  
  inputContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  modalInput: { fontFamily: 'Raleway_500Medium', fontSize: 15, color: '#2D3748' },
  
  advancedOptionsToggle: { marginBottom: 16, alignSelf: 'center', padding: 4 },
  advancedOptionsText: { fontFamily: 'Raleway_500Medium', fontSize: 14, color: '#A0AEC0', textDecorationLine: 'underline' },
  
  advancedOptionsContainer: { width: '100%', marginBottom: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconButton: { backgroundColor: '#0F294A', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  
  galleryContainer: { height: 70, justifyContent: 'center', alignItems: 'center' },
  imageScroll: { flex: 1, width: '100%' },
  thumbnail: { width: 70, height: 70, borderRadius: 8, marginRight: 12, opacity: 0.6 },
  thumbnailSelected: { borderWidth: 3, borderColor: '#FFFFFF', opacity: 1 },
  galleryHint: { fontFamily: 'Raleway_500Medium', fontSize: 13, color: '#A0AEC0', textAlign: 'center' },
  
  saveButton: { width: '100%', backgroundColor: '#0F294A', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 16 },
});