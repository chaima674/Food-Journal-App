import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { executeSql, runSql } from '../components/database/database';

const HomeScreen = ({ route }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [journals, setJournals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  useEffect(() => {
    const initialize = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      await loadJournals();
      setIsLoading(false);
    };
    initialize();
  }, []);

  const loadJournals = async () => {
    try {
      const userId = route.params?.userId;
      if (!userId) {
        return;
      }
      const result = await executeSql(
        'SELECT * FROM journals WHERE userId = ? ORDER BY date DESC',
        [userId]
      );
      setJournals(result.rows || []);
    } catch (error) {
      console.error('Error loading journals:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!camera) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }
    try {
      const photo = await camera.takePictureAsync({ quality: 0.7 });
      setImage(photo.uri);
      setIsCameraOpen(false);
    } catch (error) {
      Alert.alert('Camera Error', 'Failed to take picture');
    }
  };

  const saveJournal = async () => {
    if (!image || !description.trim()) {
      Alert.alert('Validation Error', 'Please add an image and description');
      return;
    }
    try {
      const userId = route.params?.userId;
      if (editingId) {
        await runSql(
          'UPDATE journals SET image = ?, description = ?, category = ? WHERE id = ?',
          [image, description.trim(), selectedCategory, editingId]
        );
        Alert.alert('Success', 'Journal updated');
      } else {
        await runSql(
          'INSERT INTO journals (userId, image, description, category, date) VALUES (?, ?, ?, ?, ?)',
          [userId, image, description.trim(), selectedCategory, new Date().toISOString()]
        );
        Alert.alert('Success', 'Journal saved');
      }
      await loadJournals();
      setImage(null);
      setDescription('');
      setEditingId(null);
      setSelectedCategory('All');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const deleteJournal = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await runSql('DELETE FROM journals WHERE id = ?', [id]);
          await loadJournals();
          Alert.alert('Success', 'Deleted');
        },
        style: 'destructive',
      },
    ]);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Breakfast: '#FF9800',
      Lunch: '#4CAF50',
      Dinner: '#F44336',
      Snacks: '#9C27B0'
    };
    return colors[cat] || '#4285f4';
  };

  const filteredJournals = selectedCategory === 'All'
    ? journals
    : journals.filter((item) => item.category === selectedCategory);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Input Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{editingId ? 'Edit Entry' : 'Add New Entry'}</Text>

        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => setIsCameraOpen(true)}>
            <Text style={styles.btnText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
            <Text style={styles.btnText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="What did you eat?"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
        />

        <Text style={styles.label}>Category:</Text>
        <View style={styles.categoryRow}>
          {categories.filter(c => c !== 'All').map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, selectedCategory === cat && { backgroundColor: getCategoryColor(cat) }]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveJournal}>
          <Text style={styles.saveBtnText}>{editingId ? 'UPDATE' : 'SAVE'}</Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            setImage(null);
            setDescription('');
            setEditingId(null);
            setSelectedCategory('All');
          }}>
            <Text style={styles.cancelBtnText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Journal List */}
      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>My Food Journal</Text>

        <Text style={styles.label}>Filter by:</Text>
        <View style={styles.filterRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterBtn, selectedCategory === cat && styles.filterBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredJournals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No entries yet</Text>
            <Text style={styles.emptySubtext}>Add your first meal above!</Text>
          </View>
        ) : (
          filteredJournals.map(item => (
            <View key={item.id} style={styles.journalItem}>
              <Image source={{ uri: item.image }} style={styles.journalImage} />
              <View style={styles.journalInfo}>
                <Text style={styles.journalDesc}>{item.description}</Text>
                <Text style={[styles.journalCategory, { color: getCategoryColor(item.category) }]}>
                  {item.category}
                </Text>
                <Text style={styles.journalDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editAction]}
                    onPress={() => {
                      setEditingId(item.id);
                      setDescription(item.description);
                      setImage(item.image);
                      setSelectedCategory(item.category);
                    }}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteAction]}
                    onPress={() => deleteJournal(item.id)}
                  >
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Camera Modal */}
      <Modal visible={isCameraOpen} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} type="back" ref={ref => setCamera(ref)} />
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeCamera} onPress={() => setIsCameraOpen(false)}>
              <Text style={styles.closeCameraText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  formCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cameraBtn: {
    backgroundColor: '#4285f4',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  galleryBtn: {
    backgroundColor: '#34a853',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryBtn: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#333',
  },
  categoryTextActive: {
    color: 'white',
  },
  saveBtn: {
    backgroundColor: '#34a853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#ea4335',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  filterBtnActive: {
    backgroundColor: '#4285f4',
  },
  filterText: {
    color: '#333',
  },
  filterTextActive: {
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  journalItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
  },
  journalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  journalInfo: {
    flex: 1,
    marginLeft: 10,
  },
  journalDesc: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  journalCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  journalDate: {
    fontSize: 10,
    color: '#888',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  editAction: {
    backgroundColor: '#fbbc05',
  },
  deleteAction: {
    backgroundColor: '#ea4335',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeCamera: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
  },
  closeCameraText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;