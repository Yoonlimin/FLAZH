import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import FlazhLogo from './FlazhLogo';

export default function EditWordScreen({ wordData, onBack, onSave, onDelete }) {
  const [word, setWord] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  
  // Reference to auto-focus the image input when the user chooses "Paste URL"
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (wordData) {
      setWord(wordData.word || '');
      setDescription(wordData.description || '');
      setImage(wordData.image_url || '');
    }
  }, [wordData]);

  // ✨ 2. The function that actually opens the phone's gallery
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
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  // ✨ 3. The new menu that pops up when you tap "Change"
  const handleChangePhotoPress = () => {
    Alert.alert(
      "Update Image",
      "How would you like to add a photo?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Pick from Gallery", onPress: pickImage },
        { text: "Paste Web URL", onPress: () => imageInputRef.current?.focus() }
      ]
    );
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        
        <View style={styles.titleHeaderBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={28} color="#0A2540" />
          </TouchableOpacity>
          <FlazhLogo />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.inputLabel}>Word</Text>
          <TextInput 
            style={styles.input} 
            value={word} 
            onChangeText={setWord} 
            placeholderTextColor="#A0AEC0"
            autoFocus={true} 
          />
          
          <Text style={styles.inputLabel}>Description / Translation</Text>
          <TextInput 
            style={styles.input} 
            value={description} 
            onChangeText={setDescription} 
            placeholderTextColor="#A0AEC0"
          />
          
          <Text style={styles.inputLabel}>Image</Text>
          
          <View style={styles.imagePreviewContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={48} color="#A0AEC0" />
              </View>
            )}
            
            {/* ✨ Trigger the pop-up menu instead! */}
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

          {/* ✨ 4. I added the URL text box back so the app has somewhere to paste the link! */}
          <TextInput 
            ref={imageInputRef}
            style={[styles.input, { marginTop: 16 }]} 
            placeholder="Paste image URL here..." 
            value={image} 
            onChangeText={setImage} 
            placeholderTextColor="#A0AEC0"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={() => onSave({ ...wordData, word, description, image_url: image })}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Your styles remain exactly the same!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  titleHeaderBar: { width: '100%', paddingHorizontal: 24, paddingTop: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 20, bottom: 12, zIndex: 10 },
  logoText: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', letterSpacing: 1.5, textAlign: 'center' },
  scrollContainer: { paddingHorizontal: 24, marginTop: 28 }, 
  inputLabel: { fontFamily: 'Raleway_700Bold', fontSize: 14, color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, marginBottom: 20, fontFamily: 'Raleway_500Medium', fontSize: 16, color: '#2D3748' },
  imagePreviewContainer: { width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageChangeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  imageChangeBadge: { flexDirection: 'row', backgroundColor: 'rgba(10, 37, 64, 0.8)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center' },
  imageChangeText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 14, marginLeft: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  deleteButton: { flex: 1, paddingVertical: 16, backgroundColor: '#FED7D7', borderRadius: 12, alignItems: 'center', marginRight: 10 },
  deleteText: { color: '#C53030', fontFamily: 'Raleway_700Bold', fontSize: 16 },
  saveButton: { flex: 2, paddingVertical: 16, backgroundColor: '#0A2540', borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontFamily: 'Raleway_700Bold', fontSize: 16 },
});