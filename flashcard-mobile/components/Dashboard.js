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
import { Ionicons } from '@expo/vector-icons';

Asset.loadAsync([
  require('../assets/logo.png'),
  require('../assets/google.jpg'),
]);

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_SIZE = (SCREEN_WIDTH - 48 - 32) / 3;

// Our perfect list of baby / pastel colors!
const babyColors = [
  '#B4D4FF', // Baby Blue
  '#FFD1DC', // Pastel Pink
  '#A8E6CF', // Mint Green
  '#DCD0FF', // Lavender
  '#FFDAC1', // Peach
  '#FDFFB6', // Pale Yellow
  '#E2F0CB', // Light Matcha
  '#C5E3F6'  // Soft Cyan
];

// Helper function to grab a random color from the list
const getRandomBabyColor = () => {
  return babyColors[Math.floor(Math.random() * babyColors.length)];
};

export default function Dashboard({ user, onLogout }) {
  const [flashbooks, setFlashbooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  const userId = user?.id || 1;

  const fetchFlashbooks = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashbooks/${userId}`);
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
    const folderColor = getRandomBabyColor();

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashbooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, color: folderColor }), 
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
          <View style={[styles.folderWrapper, styles.addFolderWrapper]}>
            <View style={styles.folderBackAdd}>
               <View style={styles.folderTabAdd} />
            </View>
            <View style={styles.folderFrontAdd}>
              <View style={styles.plusCircle}>
                <Text style={styles.plusSign}>+</Text>
              </View>
            </View>
          </View>
          <Text style={styles.deckTitle}> </Text>
        </TouchableOpacity>
      );
    }

    const activeColor = item.color || '#B4D4FF';

    return (
      <TouchableOpacity 
        style={styles.cardContainer} 
        activeOpacity={0.8}
        onPress={() => setSelectedDeck(item)}
      >
        <View style={styles.folderWrapper}>
          <View style={[styles.folderBack, { backgroundColor: activeColor }]}>
            <View style={[styles.folderTab, { backgroundColor: activeColor }]} />
          </View>

          <View style={styles.folderPaper}>
            <View style={styles.paperLineLong} />
            <View style={styles.paperLineShort} />
          </View>

          <View style={[styles.folderFront, { backgroundColor: activeColor + 'E6' }]} />
        </View>
        <Text style={styles.deckTitle} numberOfLines={1}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  if (selectedDeck) {
    return <FlashbookDetail deck={selectedDeck} onBack={() => setSelectedDeck(null)} />;
  }

  return (
    <View style={styles.innerContainer}>
      <View style={styles.headerBar}>
        <Image source={require('../assets/logo.png')} style={styles.smallLogo} resizeMode="contain" />
        <TouchableOpacity onPress={onLogout}>
          <Ionicons name="log-out-outline" size={28} color="#FF4D4D" />
        </TouchableOpacity>
      </View>

      <Text style={styles.logoText}>FLAZH</Text>
      
      {/* ✨ Dynamic Text Title based on whether they have flashbooks or not */}
      <Text style={styles.screenSubtitle}>
        {flashbooks.length === 0 ? "Create your new flashbook!" : "Your flashbooks"}
      </Text>

      {flashbooks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.folderCardGraphic}>
            
            {/* ✨ New Beautiful 3D Folder for the Empty State */}
            <View style={styles.emptyFolderWrapper}>
              {/* Layer 1: Back */}
              <View style={[styles.emptyFolderBack, { backgroundColor: '#8E9BB0' }]}>
                <View style={[styles.emptyFolderTab, { backgroundColor: '#8E9BB0' }]} />
              </View>
              {/* Layer 2: Paper */}
              <View style={styles.emptyFolderPaper}>
                <View style={styles.emptyPaperLineLong} />
                <View style={styles.emptyPaperLineShort} />
              </View>
              {/* Layer 3: Front */}
              <View style={[styles.emptyFolderFront, { backgroundColor: '#8E9BB0E6' }]} />
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
  newButton: { backgroundColor: '#0F294A', paddingVertical: 10, paddingHorizontal: 36, borderRadius: 10, marginBottom: 16 },
  newButtonText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 16 },
  emptyStateDescription: { fontFamily: 'Raleway_500Medium', fontSize: 13, color: '#A0AEC0', textAlign: 'center', lineHeight: 18 },

  gridContent: { paddingHorizontal: 24, paddingBottom: 40 },
  cardContainer: { width: COLUMN_SIZE, alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
  
  // Grid Folder Styles
  folderWrapper: {
    width: COLUMN_SIZE - 8,
    height: COLUMN_SIZE - 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  folderBack: { position: 'absolute', bottom: 0, width: '100%', height: '90%', borderRadius: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  folderTab: { position: 'absolute', top: -6, left: 8, width: '40%', height: 10, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  folderPaper: { position: 'absolute', bottom: '20%', width: '85%', height: '75%', backgroundColor: '#FFFFFF', borderRadius: 6, padding: 6, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  paperLineLong: { width: '90%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 4 },
  paperLineShort: { width: '60%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
  folderFront: { width: '100%', height: '70%', borderRadius: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  
  // Add Folder Styles
  addFolderWrapper: { opacity: 0.9 },
  folderBackAdd: { position: 'absolute', bottom: 0, width: '100%', height: '90%', backgroundColor: '#132644', borderRadius: 8 },
  folderTabAdd: { position: 'absolute', top: -6, left: 8, width: '40%', height: 10, backgroundColor: '#132644', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  folderFrontAdd: { width: '100%', height: '70%', backgroundColor: '#1A335C', borderRadius: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6, elevation: 2, justifyContent: 'center', alignItems: 'center' },
  plusCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#132644', borderWidth: 2, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  plusSign: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  deckTitle: { fontFamily: 'Raleway_500Medium', fontSize: 12, color: '#1A202C', marginTop: 12, textAlign: 'center' },

  // ✨ Empty State Folder Styles (Larger version)
  emptyFolderWrapper: {
    width: 140,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  emptyFolderBack: { position: 'absolute', bottom: 0, width: '100%', height: '90%', borderRadius: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  emptyFolderTab: { position: 'absolute', top: -8, left: 12, width: '40%', height: 14, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  emptyFolderPaper: { position: 'absolute', bottom: '20%', width: '85%', height: '75%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  emptyPaperLineLong: { width: '90%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 6 },
  emptyPaperLineShort: { width: '60%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 },
  emptyFolderFront: { width: '100%', height: '70%', borderRadius: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6 },
});