import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import CreateFlashbookModal from './CreateFlashbookModal';
import FlashbookDetail from './FlashbookDetail';
import { Asset } from 'expo-asset';


Asset.loadAsync([
  require('../assets/logo.png'),
  require('../assets/google.jpg'),
]);

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_SIZE = (SCREEN_WIDTH - 48 - 32) / 3;

// ⚠️ Make sure this points to your machine's IP address!
const BACKEND_URL = 'http://192.168.101.222:5000';

export default function Dashboard({ user, onLogout }) {
  const [flashbooks, setFlashbooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  const userId = user?.id || 1;

  const fetchFlashbooks = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/flashbooks/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setFlashbooks(data);
      }
    } catch (error) {
      console.error("Error fetching flashbooks:", error);
    }
  };

  useEffect(() => {
    fetchFlashbooks();
  }, []);

  const handleSaveFlashbook = async (title) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/flashbooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title }),
      });

      if (response.ok) {
        setModalVisible(false);
        fetchFlashbooks();
      }
    } catch (error) {
      console.error("Error creating flashbook:", error);
    }
  };

  const gridData = [{ id: 'add-button', isAdd: true }, ...flashbooks];

  const renderGridItem = ({ item }) => {
    if (item.isAdd) {
      return (
        <TouchableOpacity style={styles.cardContainer} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <View style={[styles.deckSquare, styles.addDeckSquare]}>
            <View style={styles.plusCircle}>
              <Text style={styles.plusSign}>+</Text>
            </View>
          </View>
          <Text style={styles.deckTitle}> </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.cardContainer} 
        activeOpacity={0.8}
        onPress={() => setSelectedDeck(item)}
      >
        <View style={[styles.deckSquare, { backgroundColor: item.color || '#8E9BB0' }]} />
        <Text style={styles.deckTitle} numberOfLines={1}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  // If a folder is open, render the detail component!
  if (selectedDeck) {
    return <FlashbookDetail deck={selectedDeck} onBack={() => setSelectedDeck(null)} />;
  }

  return (
    <View style={styles.innerContainer}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Image source={require('../assets/logo.png')} style={styles.smallLogo} resizeMode="contain" />
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutLink}>Log Out</Text>
        </TouchableOpacity>
      </View>

      
        <Text style={styles.logoText}>FLAZH</Text>
        <Text style={styles.screenSubtitle}>Create your new flashbook!</Text>

        {flashbooks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.folderCardGraphic}>
              <View style={styles.folderGraphicInner}>
                <View style={styles.folderLine} />
              </View>
            </View>

            <TouchableOpacity style={styles.newButton} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
              <Text style={styles.newButtonText}>New</Text>
            </TouchableOpacity>

            <Text style={styles.emptyStateDescription}>
              You can create different flashbooks for different categories and save your own flashcards
            </Text>
          </View>
        ) : (
          <FlatList
            data={gridData}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}
     

      {/* Modular Creation Modal */}
      <CreateFlashbookModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleSaveFlashbook} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: { flex: 1, width: '100%', backgroundColor: '#FFFFFF' },
  headerBar: { width: '100%', paddingHorizontal: 24, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallLogo: { width: 100, height: 60, marginLeft: -20 },
  logoutLink: { fontFamily: 'Raleway_500Medium', fontSize: 14, color: '#FF4D4D' },
  logoText: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', letterSpacing: 1.5, textAlign: 'center', marginTop: 10 },
  screenSubtitle: { fontFamily: 'Raleway_500Medium', fontSize: 18, color: '#1A202C', textAlign: 'center', marginTop: 10, marginBottom: 20 },

  emptyStateContainer: { alignItems: 'center', paddingHorizontal: 32, marginTop: 10 },
  folderCardGraphic: { width: '100%', height: 260, backgroundColor: '#F2F4F7', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  folderGraphicInner: { width: 140, height: 110, backgroundColor: '#8E9BB0', borderRadius: 16, padding: 12 },
  folderLine: { width: '80%', height: 6, backgroundColor: '#FFFFFF', borderRadius: 3 },
  newButton: { backgroundColor: '#0F294A', paddingVertical: 10, paddingHorizontal: 36, borderRadius: 10, marginBottom: 16 },
  newButtonText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 16 },
  emptyStateDescription: { fontFamily: 'Raleway_500Medium', fontSize: 13, color: '#A0AEC0', textAlign: 'center', lineHeight: 18 },

  gridContent: { paddingHorizontal: 24, paddingBottom: 40 },
  cardContainer: { width: COLUMN_SIZE, alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
  deckSquare: { width: COLUMN_SIZE - 4, height: COLUMN_SIZE - 4, borderRadius: 14, elevation: 2 },
  addDeckSquare: { backgroundColor: '#132644f2', justifyContent: 'center', alignItems: 'center' },
  plusCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#132644f2', borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: -14, bottom: 10 },
  plusSign: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: -3 },
  deckTitle: { fontFamily: 'Raleway_500Medium', fontSize: 12, color: '#1A202C', marginTop: 8, textAlign: 'center' },
});