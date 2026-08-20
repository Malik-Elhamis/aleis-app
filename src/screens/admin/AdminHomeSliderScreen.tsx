import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { subscribeHomeSliderSettings, updateHomeSliderSettings } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

export const AdminHomeSliderScreen: React.FC<any> = ({ navigation }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const unsub = subscribeHomeSliderSettings((data) => {
      setImages(data.images);
      setHasChanges(false);
    });
    return () => unsub();
  }, []);

  const handleAddImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    
    setIsUploading(true);
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 0.3, // Compresses image to make base64 string very small
        allowsMultipleSelection: true,
        base64: true, // Get base64 directly from native module!
      });
      
      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        // Process images one by one to avoid memory spikes
        const newUrls: string[] = [];
        for (const asset of pickerResult.assets) {
          try {
            // Resize heavily to ensure the base64 string is tiny (< 50KB) and fits in Firestore 1MB limit
            const manipResult = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 600 } }],
              { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            
            if (manipResult.base64) {
              newUrls.push(`data:image/jpeg;base64,${manipResult.base64}`);
            }
          } catch (e) {
            console.warn("Failed to manipulate image", e);
          }
        }
        
        if (newUrls.length > 0) {
          const updatedImages = [...images, ...newUrls];
          setImages(updatedImages);
          setHasChanges(true);
        }
      }
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء قراءة الصور.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateHomeSliderSettings(images);
      Alert.alert('نجاح', 'تم تحديث صور الرئيسية بنجاح!');
      setHasChanges(false);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في حفظ التغييرات.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>صور القائمة الرئيسية</Text>
          <Text style={styles.headerSub}>أضف مجموعة من الصور لتتحرك تلقائياً خلف اللوغو في الصفحة الرئيسية للمستخدمين.</Text>
        </View>

        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={handleAddImages}
          disabled={isUploading || isSaving}
        >
          {isUploading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Ionicons name="images-outline" size={24} color={COLORS.primary} />
          )}
          <Text style={styles.addBtnText}>إضافة صور جديدة</Text>
        </TouchableOpacity>

        {images.length === 0 && !isUploading && (
          <View style={styles.emptyState}>
            <Ionicons name="images" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>لم تقم بإضافة أي صور حتى الآن</Text>
          </View>
        )}

        <View style={styles.imagesGrid}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageCard}>
              <Image source={{ uri }} style={styles.imageThumbnail} />
              <TouchableOpacity 
                style={styles.removeBtn} 
                onPress={() => handleRemoveImage(idx)}
              >
                <Ionicons name="trash" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Save Button floating at bottom if changes made */}
      {hasChanges && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave}
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  headerSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22 },
  
  addBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight, padding: 16, borderRadius: 16, gap: 12, marginBottom: 24, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed' },
  addBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 16 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 16, marginTop: 12, fontWeight: '600' },
  
  imagesGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  imageCard: { width: '48%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', position: 'relative', ...SHADOWS.small, backgroundColor: '#FFF' },
  imageThumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeBtn: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(220,38,38,0.9)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: COLORS.border, ...SHADOWS.large },
  saveBtn: { backgroundColor: COLORS.success, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
