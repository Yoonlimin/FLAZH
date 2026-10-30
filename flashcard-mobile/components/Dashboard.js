import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  Modal // ✨ Added Modal for custom menu
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

const babyColors = [
  '#B4D4FF', '#FFD1DC', '#A8E6CF', '#DCD0FF',
  '#FFDAC1', '#FDFFB6', '#E2F0CB', '#C5E3F6'
];

const getRandomBabyColor = () => babyColors[Math.floor(Math.random() * babyColors.length)];

export default function Dashboard({ user, onLogout }) {
  const [flashbooks, setFlashbooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  const [actionMode, setActionMode] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState([]);

  const [filterMode, setFilterMode] = useState('all');
  // ✨ NEW: State to control our custom filter menu
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const userId = user?.id || 1;

  const fetchFlashbooks = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashbooks/${userId}`);
      const data = await response.json();
      if (response.ok) setFlashbooks(data);
    } catch (error) {
      console.error("Error fetching flashbooks:", error);
    }
  };

  useEffect(() => {
    fetchFlashbooks();
  }, []);

  const handleSaveFlashbook = async (title, deckType) => {
    const folderColor = getRandomBabyColor();
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashbooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, color: folderColor, deckType }),
      });

      if (response.ok) {
        setModalVisible(false);
        fetchFlashbooks();
      }
    } catch (error) {
      console.error("Error creating flashbook:", error);
    }
  };

  const handleTogglePin = async (deck) => {
    const updatedStatus = !deck.isPinned;
    setFlashbooks(prev => prev.map(f => f.id === deck.id ? { ...f, isPinned: updatedStatus } : f));
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashbooks/${deck.id}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: updatedStatus })
      });
    } catch (error) {
      console.log("Pin update error:", error);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length === 0) return;

    const performDelete = async () => {
      try {
        await Promise.all(
          selectedForDelete.map((id) =>
            fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/flashbooks/${id}`, {
              method: 'DELETE',
            })
          )
        );

        setSelectedForDelete([]);
        setActionMode(null);
        fetchFlashbooks();
      } catch (error) {
        console.error("Error deleting flashbooks:", error);
      }
    };

    // Browser-compatible confirmation for web
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedForDelete.length} flashbook(s)?`
      );
      if (confirmed) {
        performDelete();
      }
      return;
    }

    // Native mobile alert for iOS/Android
    Alert.alert(
      "Delete Flashbooks",
      `Are you sure you want to delete ${selectedForDelete.length} flashbook(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDelete,
        },
      ]
    );
  };

  const handleFolderPress = (item) => {
    if (actionMode === 'delete') {
      setSelectedForDelete(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
    } else if (actionMode === 'pin') {
      handleTogglePin(item);
    } else {
      setSelectedDeck(item);
    }
  };

  // ✨ Handle applying the filter from our custom menu
  const handleFilterSelect = (type) => {
    setFilterMode(type);
    setFilterMenuVisible(false);
  };

  const filteredFlashbooks = flashbooks.filter(deck => {
    if (filterMode === 'all') return true;
    return deck.deck_type === filterMode;
  });

  const sortedFlashbooks = [...filteredFlashbooks].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  const gridData = [{ id: 'add-button', isAdd: true }, ...sortedFlashbooks];

  const renderGridItem = ({ item }) => {
    if (item.isAdd) {
      return (
        <TouchableOpacity style={[styles.cardContainer, actionMode && { opacity: 0.5 }]} onPress={() => !actionMode && setModalVisible(true)} activeOpacity={0.8}>
          <View style={[styles.folderWrapper, styles.addFolderWrapper]}>
            <View style={styles.folderBackAdd}><View style={styles.folderTabAdd} /></View>
            <View style={styles.folderFrontAdd}><View style={styles.plusCircle}><Text style={styles.plusSign}>+</Text></View></View>
          </View>
          <Text style={styles.deckTitle}> </Text>
        </TouchableOpacity>
      );
    }

    const activeColor = item.color || '#B4D4FF';
    const isSelected = selectedForDelete.includes(item.id);

    return (
      <TouchableOpacity style={styles.cardContainer} activeOpacity={0.8} onPress={() => handleFolderPress(item)}>
        <View style={styles.folderWrapper}>

          {actionMode === 'delete' && (
            <View style={styles.badgeContainer}>
              <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={22} color={isSelected ? "#FF4D4D" : "#A0AEC0"} />
            </View>
          )}
          {item.isPinned && actionMode !== 'delete' && (
            <View style={styles.badgeContainer}>
              <Ionicons name="pricetag" size={18} color="#0A2540" style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
          )}

          <View style={[styles.folderBack, { backgroundColor: activeColor }]}><View style={[styles.folderTab, { backgroundColor: activeColor }]} /></View>
          <View style={styles.folderPaper}><View style={styles.paperLineLong} /><View style={styles.paperLineShort} /></View>
          <View style={[styles.folderFront, { backgroundColor: activeColor + 'E6' }]} />
        </View>
        <Text style={styles.deckTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  if (selectedDeck) {
    return <FlashbookDetail deck={selectedDeck} onBack={() => setSelectedDeck(null)} />;
  }

  return (
    <View style={styles.innerContainer}>
      <View style={[styles.headerBar, { zIndex: 10 }]}>
        <Image source={require('../assets/logo.png')} style={styles.smallLogo} resizeMode="contain" />
        <TouchableOpacity onPress={onLogout} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} style={{ padding: 8 }}>
          <Ionicons name="log-out-outline" size={28} color="#FF4D4D" />
        </TouchableOpacity>
      </View>

      <Text style={styles.logoText}>FLAZH</Text>
      <Text style={styles.screenSubtitle}>
        {flashbooks.length === 0 ? "Create your new flashbook!" : "Your flashbooks"}
      </Text>

      {flashbooks.length > 0 && (
        <View style={styles.toggleWrapper}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={[styles.toggleButton, actionMode === 'delete' && styles.toggleButtonActive]} onPress={() => { setActionMode(prev => prev === 'delete' ? null : 'delete'); setSelectedForDelete([]); }}>
              <Ionicons name="checkbox-outline" size={20} color={actionMode === 'delete' ? "#0A2540" : "#8E9BB0"} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toggleButton, actionMode === 'pin' && styles.toggleButtonActive]} onPress={() => { setActionMode(prev => prev === 'pin' ? null : 'pin'); setSelectedForDelete([]); }}>
              <Ionicons name="pricetag-outline" size={20} color={actionMode === 'pin' ? "#0A2540" : "#8E9BB0"} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {flashbooks.length > 0 && (
        <TouchableOpacity
          style={styles.filterMenuButton}
          onPress={() => setFilterMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="options-outline" size={26} color={filterMode !== 'all' ? "#FF4D4D" : "#0A2540"} />
        </TouchableOpacity>
      )}

      {flashbooks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.folderCardGraphic}>
            <View style={styles.emptyFolderWrapper}>
              <View style={[styles.emptyFolderBack, { backgroundColor: '#8E9BB0' }]}><View style={[styles.emptyFolderTab, { backgroundColor: '#8E9BB0' }]} /></View>
              <View style={styles.emptyFolderPaper}><View style={styles.emptyPaperLineLong} /><View style={styles.emptyPaperLineShort} /></View>
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

      {actionMode === 'delete' && selectedForDelete.length > 0 && (
        <TouchableOpacity style={styles.floatingDeleteBtn} onPress={handleDeleteSelected} activeOpacity={0.9}>
          <Text style={styles.floatingDeleteText}>Delete Selected ({selectedForDelete.length})</Text>
        </TouchableOpacity>
      )}

      <CreateFlashbookModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveFlashbook} />

      {/* ✨ NEW: Custom Filter Menu Modal */}
      <Modal visible={filterMenuVisible} transparent={true} animationType="fade" onRequestClose={() => setFilterMenuVisible(false)}>
        <TouchableOpacity style={styles.filterModalOverlay} activeOpacity={1} onPress={() => setFilterMenuVisible(false)}>
          <View style={styles.filterModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.filterModalTitle}>View Options</Text>

            <TouchableOpacity style={[styles.filterOption, filterMode === 'all' && styles.filterOptionActive]} onPress={() => handleFilterSelect('all')}>
              <View style={[styles.filterIconBox, filterMode === 'all' && styles.filterIconBoxActive]}>
                <Ionicons name="layers" size={20} color={filterMode === 'all' ? '#FFF' : '#A0AEC0'} />
              </View>
              <Text style={[styles.filterOptionText, filterMode === 'all' && styles.filterOptionTextActive]}>All Flashbooks</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterOption, filterMode === 'picture' && styles.filterOptionActive]} onPress={() => handleFilterSelect('picture')}>
              <View style={[styles.filterIconBox, filterMode === 'picture' && styles.filterIconBoxActive]}>
                <Ionicons name="image" size={20} color={filterMode === 'picture' ? '#FFF' : '#A0AEC0'} />
              </View>
              <Text style={[styles.filterOptionText, filterMode === 'picture' && styles.filterOptionTextActive]}>Picture Decks Only</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterOption, filterMode === 'simple' && styles.filterOptionActive]} onPress={() => handleFilterSelect('simple')}>
              <View style={[styles.filterIconBox, filterMode === 'simple' && styles.filterIconBoxActive]}>
                <Ionicons name="text" size={20} color={filterMode === 'simple' ? '#FFF' : '#A0AEC0'} />
              </View>
              <Text style={[styles.filterOptionText, filterMode === 'simple' && styles.filterOptionTextActive]}>Simple Decks Only</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const CARD_WIDTH = 114;
const CARD_HEIGHT = 88;

const styles = StyleSheet.create({
  innerContainer: { flex: 1, width: '100%', backgroundColor: '#FFFFFF' },
  headerBar: { width: '100%', paddingHorizontal: 24, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallLogo: { width: 100, height: 60, marginLeft: -20 },

  logoText: { fontFamily: 'Raleway_700Bold', fontSize: 36, color: '#0A2540', letterSpacing: 1.5, textAlign: 'center', bottom: 54 },
  screenSubtitle: { fontFamily: 'Raleway_500Medium', fontSize: 18, color: '#1A202C', textAlign: 'center', marginTop: 5, bottom: 48 },

  toggleWrapper: { justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F2F4F7', borderRadius: 8, padding: 4, width: 160 },
  toggleButton: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  toggleButtonActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },

  filterMenuButton: { position: 'absolute', right: 24, top: 153, zIndex: 20 },

  floatingDeleteBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#FF4D4D', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  floatingDeleteText: { color: '#FFF', fontFamily: 'Raleway_700Bold', fontSize: 16 },
  badgeContainer: { position: 'absolute', top: -6, right: -6, zIndex: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 2 },

  // ✨ NEW: Filter Modal Styles
  filterModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  filterModalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  filterModalTitle: { fontFamily: 'Raleway_700Bold', fontSize: 18, color: '#0A2540', marginBottom: 20, textAlign: 'center' },
  filterOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  filterOptionActive: { backgroundColor: '#0A2540', borderColor: '#0A2540' },
  filterIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  filterIconBoxActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  filterOptionText: { fontFamily: 'Raleway_600SemiBold', fontSize: 15, color: '#4A5568' },
  filterOptionTextActive: { color: '#FFFFFF' },

  emptyStateContainer: { alignItems: 'center', paddingHorizontal: 32, marginTop: 60 },
  folderCardGraphic: { width: '100%', height: 260, backgroundColor: '#F2F4F7', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  newButton: { backgroundColor: '#0F294A', paddingVertical: 10, paddingHorizontal: 36, borderRadius: 10, marginBottom: 16 },
  newButtonText: { fontFamily: 'Raleway_700Bold', color: '#FFFFFF', fontSize: 16 },
  emptyStateDescription: { fontFamily: 'Raleway_500Medium', fontSize: 13, color: '#A0AEC0', textAlign: 'center', lineHeight: 18 },

  gridContent: { paddingHorizontal: 24, paddingBottom: 100 },
  cardContainer: { width: COLUMN_SIZE, alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
  folderWrapper: { width: COLUMN_SIZE - 8, height: COLUMN_SIZE - 12, justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 },
  folderBack: { position: 'absolute', bottom: 0, width: '100%', height: '90%', borderRadius: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  folderTab: { position: 'absolute', top: -6, left: 8, width: '40%', height: 10, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  folderPaper: { position: 'absolute', bottom: '20%', width: '85%', height: '75%', backgroundColor: '#FFFFFF', borderRadius: 6, padding: 6, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  paperLineLong: { width: '90%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 4 },
  paperLineShort: { width: '60%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
  folderFront: { width: '100%', height: '70%', borderRadius: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4 },

  mainContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Keeps it framed like a mobile app even on desktop laptops
    alignSelf: 'center',
    paddingHorizontal: 20,
  },

  // 2. Folder scroll/grid container
  foldersContainer: {
    width: '100%',
    paddingBottom: 40,
    alignItems: 'center',
  },

  // 3. Responsive folder card size
  folderCard: {
    width: '100%', // Fills the container width cleanly
    aspectRatio: 1.25, // Automatically maintains folder proportions without hardcoded massive heights
    maxHeight: 280, // Caps height on taller screens
    backgroundColor: '#2A4365',
    borderRadius: 18,
    position: 'relative',
    marginVertical: 12,
    overflow: 'hidden',
  },

  // 4. Folder top tab (if you have the folder tab shape)
  folderTab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '55%',
    height: 38,
    backgroundColor: '#1E314B',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 14,
  },

  // 5. Centered plus / action button inside the card
  addDeckButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addFolderWrapper: { opacity: 0.9 },
  folderBackAdd: { position: 'absolute', bottom: 0, width: '100%', height: '90%', backgroundColor: '#132644', borderRadius: 8 },
  folderTabAdd: { position: 'absolute', top: -6, left: 8, width: '40%', height: 10, backgroundColor: '#132644', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  folderFrontAdd: { width: '100%', height: '70%', backgroundColor: '#1A335C', borderRadius: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6, elevation: 2, justifyContent: 'center', alignItems: 'center' },
  plusCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#132644', borderWidth: 2, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  plusSign: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  deckTitle: { fontFamily: 'Raleway_500Medium', fontSize: 12, color: '#1A202C', marginTop: 12, textAlign: 'center' },

  emptyFolderWrapper: { width: 140, height: 110, justifyContent: 'flex-end', alignItems: 'center' },
  emptyFolderBack: { position: 'absolute', bottom: 0, width: '100%', height: '90%', borderRadius: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  emptyFolderTab: { position: 'absolute', top: -8, left: 12, width: '40%', height: 14, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  emptyFolderPaper: { position: 'absolute', bottom: '20%', width: '85%', height: '75%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  emptyPaperLineLong: { width: '90%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 6 },
  emptyPaperLineShort: { width: '60%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 },
  emptyFolderFront: { width: '100%', height: '70%', borderRadius: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6 },
});