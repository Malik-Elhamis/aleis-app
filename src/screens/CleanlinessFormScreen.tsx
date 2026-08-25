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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { submitCleanlinessRequest } from '../services/firestoreService';
import { uploadComplaintImages } from '../services/storageService';
import { COLORS, SPACING } from '../config/theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { auth } from '../config/firebase';
import { RootStackParamList } from '../navigation/types';

export const CleanlinessFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CleanlinessForm'>>();
  const requestType = route.params?.requestType || 'container';

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFormTitle = () => {
    switch(requestType) {
      case 'container': return 'طلب حاوية نفايات';
      case 'hygiene': return 'بلاغ تراكم نفايات';
      case 'pest_control': return 'طلب مكافحة حشرات';
      default: return 'طلب خدمات نظافة';
    }
  };

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
      Alert.alert('تنبيه', 'يرجى إدخال الموقع والتفاصيل.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : 'anonymous';

      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadComplaintImages(images, `cleanliness_${Date.now()}`);
      }

      await submitCleanlinessRequest({
        type: requestType,
        location: location.trim(),
        description: description.trim(),
        images: uploadedImageUrls,
        status: 'pending',
        userId
      });

      Alert.alert('نجاح', 'تم إرسال طلبك بنجاح. شكراً لتعاونك في الحفاظ على نظافة البيئة.', [
        { text: 'حسناً', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getFormTitle()}</Text>
          <Text style={styles.headerSubtitle}>يرجى تعبئة التفاصيل بدقة ليتسنى لنا خدمتكم بشكل أسرع</Text>
        </View>

        <CustomInput
          label="الموقع / الحي *"
          placeholder="مثال: حي الورود، الشارع العام"
          value={location}
          onChangeText={setLocation}
        />

        <CustomInput
          label="تفاصيل الطلب *"
          placeholder="اكتب تفاصيل طلبك أو بلاغك هنا..."
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
          title={isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'left', alignSelf: 'flex-start', lineHeight: 22, width: '100%' },
  
  imageSection: { marginTop: 16, marginBottom: 24 },
  imageTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'left', alignSelf: 'flex-start', marginBottom: 12, width: '100%' },
  imageScroll: { flexDirection: 'row-reverse' },
  imageContainer: { position: 'relative', marginLeft: 12 },
  image: { width: 100, height: 100, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 12 },
  addImageBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  addImageText: { marginTop: 8, fontSize: 12, color: COLORS.textSecondary },

  submitBtn: { marginTop: 12, backgroundColor: '#10B981' },
});
