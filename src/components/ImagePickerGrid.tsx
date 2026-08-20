import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

interface ImagePickerGridProps {
  images: string[];
  onImagesChange: (newImages: string[]) => void;
  maxImages?: number;
}

export const ImagePickerGrid: React.FC<ImagePickerGridProps> = ({
  images,
  onImagesChange,
  maxImages = 99,
}) => {
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('الإذونات مطلوبة', 'يرجى منح إذن الوصول إلى الصور لإرفاقها بالبلاغ');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const selectedUris = result.assets.map(asset => asset.uri);
      const combined = [...images, ...selectedUris].slice(0, maxImages);
      onImagesChange(combined);
    }
  };

  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('الإذونات مطلوبة', 'يرجى منح إذن الوصول إلى الكاميرا لالتقاط صورة البلاغ');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const combined = [...images, result.assets[0].uri].slice(0, maxImages);
      onImagesChange(combined);
    }
  };

  const showPickOptions = () => {
    if (images.length >= maxImages) {
      Alert.alert('تنبيه', `الحد الأقصى للصور هو ${maxImages}`);
      return;
    }

    Alert.alert(
      'إضافة صورة للبلاغ',
      'اختر مصدر الصورة:',
      [
        { text: 'التقاط بواسطة الكاميرا 📷', onPress: takePhotoWithCamera },
        { text: 'معرض الصور 🖼️', onPress: pickFromGallery },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>صور توثيقية للبلاغ ({images.length})</Text>
      </View>

      <View style={styles.grid}>
        {images.map((uri, index) => (
          <View key={`${uri}_${index}`} style={[styles.imageWrapper, SHADOWS.small]}>
            <Image source={{ uri }} style={styles.imageThumbnail} />
            <TouchableOpacity
              style={styles.deleteBadge}
              onPress={() => removeImage(index)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showPickOptions}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
            <Text style={styles.addText}>إضافة صورة</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
});
