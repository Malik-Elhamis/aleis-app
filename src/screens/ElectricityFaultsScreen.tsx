import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { submitElectricityFault } from '../services/firestoreService';
import { uploadComplaintImages } from '../services/storageService';
import { COLORS, SPACING } from '../config/theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { auth } from '../config/firebase';

export const ElectricityFaultsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [type, setType] = useState<'outage' | 'street_light' | 'theft' | 'other'>('outage');
  const [otherType, setOtherType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setImages([...images, pickerResult.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!location.trim() || !description.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الموقع ووصف العطل.');
      return;
    }
    if (type === 'other' && !otherType.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة نوع العطل الآخر.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : 'anonymous';

      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadComplaintImages(images, `electricity_${Date.now()}`);
      }

      await submitElectricityFault({
        type: type === 'other' ? `أخرى: ${otherType.trim()}` : type,
        location: location.trim(),
        description: description.trim(),
        images: uploadedImageUrls,
        status: 'pending',
        userId
      });

      Alert.alert('نجاح', 'تم إرسال بلاغك بنجاح. سيتم التعامل معه في أقرب وقت.', [
        { text: 'حسناً', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الإبلاغ عن عطل كهربائي</Text>
          <Text style={styles.headerSubtitle}>يرجى تحديد نوع العطل والموقع بدقة</Text>
        </View>

        <Text style={styles.label}>نوع العطل *</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'outage' && styles.typeBtnActive]}
            onPress={() => setType('outage')}
          >
            <Ionicons name="flash-off" size={20} color={type === 'outage' ? '#FFF' : COLORS.textPrimary} />
            <Text style={[styles.typeBtnText, type === 'outage' && styles.typeBtnTextActive]}>انقطاع تيار</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'street_light' && styles.typeBtnActive]}
            onPress={() => setType('street_light')}
          >
            <Ionicons name="bulb" size={20} color={type === 'street_light' ? '#FFF' : COLORS.textPrimary} />
            <Text style={[styles.typeBtnText, type === 'street_light' && styles.typeBtnTextActive]}>إنارة شوارع</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'theft' && styles.typeBtnActive]}
            onPress={() => setType('theft')}
          >
            <Ionicons name="warning" size={20} color={type === 'theft' ? '#FFF' : COLORS.textPrimary} />
            <Text style={[styles.typeBtnText, type === 'theft' && styles.typeBtnTextActive]}>سرقة كهرباء</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'other' && styles.typeBtnActive]}
            onPress={() => setType('other')}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={type === 'other' ? '#FFF' : COLORS.textPrimary} />
            <Text style={[styles.typeBtnText, type === 'other' && styles.typeBtnTextActive]}>أخرى</Text>
          </TouchableOpacity>
        </View>

        {type === 'other' && (
          <CustomInput
            label="تفاصيل العطل الآخر *"
            placeholder="اكتب نوع العطل هنا..."
            value={otherType}
            onChangeText={setOtherType}
          />
        )}

        <CustomInput
          label="الموقع / الحي *"
          placeholder="مثال: حي النسيم، بجوار المسجد"
          value={location}
          onChangeText={setLocation}
        />

        <CustomInput
          label="وصف العطل *"
          placeholder="اكتب تفاصيل العطل هنا..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.imageSection}>
          <Text style={styles.imageTitle}>المرفقات والصور (اختياري)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                <Text style={styles.addImageText}>إضافة صورة</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <CustomButton
          title={isSubmitting ? "جاري الإرسال..." : "إرسال البلاغ"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
};

// Modern Electric Palette (Light & Vibrant)
const ELECTRIC_COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#2563EB',
  accent: '#F59E0B',
  textPrimary: '#0F172A',
  textSecondary: '#64748B'
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ELECTRIC_COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: ELECTRIC_COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: ELECTRIC_COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  
  label: { fontSize: 16, fontWeight: '700', color: ELECTRIC_COLORS.textPrimary, textAlign: 'left', marginBottom: 12 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: ELECTRIC_COLORS.surface, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  typeBtnActive: { backgroundColor: ELECTRIC_COLORS.primary, borderColor: ELECTRIC_COLORS.primary },
  typeBtnText: { fontSize: 13, fontWeight: '700', color: ELECTRIC_COLORS.textPrimary },
  typeBtnTextActive: { color: '#FFF' },

  imageSection: { marginTop: 16, marginBottom: 24 },
  imageTitle: { fontSize: 16, fontWeight: '700', color: ELECTRIC_COLORS.textPrimary, textAlign: 'left', marginBottom: 12 },
  imageScroll: { flexDirection: 'row' },
  imageContainer: { position: 'relative', marginLeft: 12 },
  image: { width: 100, height: 100, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 12 },
  addImageBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  addImageText: { marginTop: 8, fontSize: 12, color: ELECTRIC_COLORS.textSecondary },

  submitBtn: { marginTop: 12, backgroundColor: ELECTRIC_COLORS.primary },
});
