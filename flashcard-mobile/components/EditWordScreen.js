import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, SafeAreaView, Image, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import FlazhLogo from './FlazhLogo';

const PEXELS_API_KEY = 'rA5VqQSI1v4mpdF5QeVX56bpsQ1DE4BkIIyjQHFDVtk35PecRZILieDH';

// ✨ NEW: Accept deckType as a prop
export default function EditWordScreen({ wordData, onBack, onSave, onDelete, deckType }) {
  const [word, setWord] = useState('');
  const [description, setDescription] = useState('');
  const [meaning, setMeaning] = useState(''); 
  const [image, setImage] = useState('');
  
  const [showSearch, setShowSearch] = useState(false);
  const [imageKeyword, setImageKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✨ NEW: Check if it is a text-only deck
  const isSimpleDeck = deckType === 'simple'; 

  useEffect(() => {
    if (wordData) {
      setWord(wordData.word || '');
      setDescription(wordData.description || '');
      setMeaning(wordData.meaning || ''); 
      setImage(wordData.image_url || '');
    }
  }, [wordData]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setShowSearch(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSearchImage = async () => {
    if (!imageKeyword.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${imageKeyword.trim()}&per_page=10`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        setSearchResults(data.photos.map(photo => photo.src.medium));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
    setLoading(false);
  };

  const handleChangePhotoPress = () => {
    const options = [
      { text: "Cancel", style: "cancel" },
      { text: "Upload from Device", onPress: pickImage },
      { text: "Search Online", onPress: () => setShowSearch(true) }
    ];

    if (image) {
      options.push({ 
        text: "Remove Image", 
        onPress: () => setImage(''), 
        style: "destructive" 
      });
    }

    Alert.alert("Update Image", "How would you like to add or change the photo?", options);
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Word",
      "Are you sure you want to delete this flashcard?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => onDelete(wordData.id) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.keyboardView}>
        
        <View style={styles.titleHeaderBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={28} color="#0A2540" />
          </TouchableOpacity>
          <FlazhLogo />
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={{ paddingBottom: 30 }} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          
          <Text style={styles.inputLabel}>Word</Text>
          <TextInput 
            style={styles.input} 
            value={word} 
            onChangeText={setWord} 
            placeholderTextColor="#A0AEC0"
          />
          
          <Text style={styles.inputLabel}>Description / Pronunciation</Text>
          <TextInput 
            style={styles.input} 
            value={description} 
            onChangeText={setDescription} 
            placeholderTextColor="#A0AEC0"
          />

          <Text style={styles.inputLabel}>Meaning</Text>
          <TextInput 
            style={styles.input} 
            value={meaning} 
            onChangeText={setMeaning} 
            placeholder="e.g., Station..."
            placeholderTextColor="#A0AEC0"
          />
          
          {/* ✨ NEW: Hide entire image section if it is a simple deck */}
          {!isSimpleDeck && (
            <>
              <Text style={styles.inputLabel}>Image</Text>
              <View style={styles.imagePreviewContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={48} color="#A0AEC0" />
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.imageChangeOverlay} 
                  activeOpacity={0.8}
                  onPress={handleChangePhotoPress}
                >
                  <View style={styles.imageChangeBadge}>
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                    <Text style={styles.imageChangeText}>Change</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {showSearch && (
                <View style={styles.searchSection}>
                  <View style={styles.searchRow}>
                    <TextInput 
                      style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                      placeholder="Search keywords (e.g. dog, running)..." 
                      value={imageKeyword}
                      onChangeText={setImageKeyword}
                      onSubmitEditing={handleSearchImage}
                      placeholderTextColor="#A0AEC0"
                    />
                    <TouchableOpacity style={styles.searchIconButton} onPress={handleSearchImage}>
                      <Ionicons name="search" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  
                  {loading ? (
                    <ActivityIndicator size="small" color="#0A2540" style={{ marginVertical: 16 }} />
                  ) : searchResults.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                      {searchResults.map((imgUrl, index) => (
                        <TouchableOpacity 
                          key={index} 
                          onPress={() => {
                            setImage(imgUrl);
                            setShowSearch(false);
                          }}
                        >
                          <Image source={{ uri: imgUrl }} style={styles.thumbnail} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              )}
            </>
          )}

          {/* ✨ NEW: Check if simple deck is active for margin logic */}
          <View style={[styles.buttonRow, { marginTop: showSearch && !isSimpleDeck ? 10 : 20 }]}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={() => onSave({ 
                ...wordData, 
                word, 
                description, 
                meaning, 
                // ✨ Ensure no image saves for simple decks
                image_url: isSimpleDeck ? null : image 
              })}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  titleHeaderBar: { width: '100%', paddingHorizontal: 24, paddingTop: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 20, bottom: 12, zIndex: 10 },
  scrollContainer: { paddingHorizontal: 24, marginTop: 28 }, 
  inputLabel: { fontFamily: 'Raleway_700Bold', fontSize: 14, color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, marginBottom: 20, fontFamily: 'Raleway_500Medium', fontSize: 16, color: '#2D3748' },
  
  imagePreviewContainer: { width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageChangeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  imageChangeBadge: { flexDirection: 'row', backgroundColor: 'rgba(10, 37, 64, 0.8)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center' },
  imageChangeText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 14, marginLeft: 8 },
  
  searchSection: { marginTop: 16, backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchIconButton: { backgroundColor: '#0A2540', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  galleryScroll: { marginTop: 12 },
  thumbnail: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  deleteButton: { flex: 1, paddingVertical: 16, backgroundColor: '#FED7D7', borderRadius: 12, alignItems: 'center', marginRight: 10 },
  deleteText: { color: '#C53030', fontFamily: 'Raleway_700Bold', fontSize: 16 },
  saveButton: { flex: 2, paddingVertical: 16, backgroundColor: '#0A2540', borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontFamily: 'Raleway_700Bold', fontSize: 16 },
});