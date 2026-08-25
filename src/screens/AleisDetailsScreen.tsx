import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const { width } = Dimensions.get('window');

export const AleisDetailsScreen: React.FC<any> = ({ route }) => {
  const { article } = route.params;
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveImageToGallery = async (uri: string) => {
    try {
      setIsSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'نحتاج إلى صلاحية الوصول للصور لحفظ الصورة.');
        setIsSaving(false);
        return;
      }

      let fileUri = uri;
      if (uri.startsWith('http')) {
        const fileExt = uri.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `aleis_${Date.now()}.${fileExt}`;
        const downloadDest = `${(FileSystem as any).documentDirectory}${fileName}`;
        
        const { uri: localUri } = await FileSystem.downloadAsync(uri, downloadDest);
        fileUri = localUri;
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('نجاح', 'تم حفظ الصورة في الاستوديو بنجاح!');
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل حفظ الصورة.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {article.images && article.images.length > 0 && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.slider}>
            {article.images.map((img: string, index: number) => (
              <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => setFullScreenImage(img)}>
                <Image source={{ uri: img }} style={styles.sliderImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            {article.description}
          </Text>
        </View>
      </ScrollView>

      {/* Full Screen Modal */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.fullScreenModalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.saveModalBtn} onPress={() => fullScreenImage && saveImageToGallery(fullScreenImage)} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={24} color="#FFF" />
                  <Text style={styles.saveModalBtnText}>حفظ الصورة</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFullScreenImage(null)}>
              <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
          </View>
          {fullScreenImage && (
            <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImg} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  slider: {
    width: width,
    height: width * 0.75,
  },
  sliderImage: {
    width: width,
    height: width * 0.75,
  },
  content: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.accent,
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 28,
    textAlign: 'left',
  },
  
  fullScreenModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  saveModalBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveModalBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  fullScreenImg: { width: '100%', height: '80%' }
});
