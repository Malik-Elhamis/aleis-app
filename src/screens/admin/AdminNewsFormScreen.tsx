import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CustomInput } from '../../components/CustomInput';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { addNewsArticle, updateNewsArticle, deleteNewsArticle } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService'; // Reusing this for now
import { NewsCategory, NewsArticle } from '../../types';

const CATEGORIES: NewsCategory[] = ['خبر عاجل', 'عامة', 'خدمات', 'ثقافية', 'صحية', 'أخرى'];

export const AdminNewsFormScreen: React.FC<any> = ({ route, navigation }) => {
  const { newsId, newsItem } = route.params || {};
  const isEditing = !!newsId;

  const [title, setTitle] = useState(newsItem?.title || '');
  const [content, setContent] = useState(newsItem?.content || '');
  const [category, setCategory] = useState<NewsCategory>(newsItem?.category || 'عامة');
  const [customCategory, setCustomCategory] = useState(newsItem?.customCategory || '');
  
  const defaultDate = new Date().toLocaleDateString('ar-EG');
  const [date, setDate] = useState(newsItem?.date || defaultDate);
  
  const [images, setImages] = useState<string[]>(newsItem?.images || []);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.3,
      allowsMultipleSelection: true,
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const newUris = pickerResult.assets.map(asset => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة عنوان وتفاصيل الخبر.');
      return;
    }
    if (category === 'أخرى' && !customCategory.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة نوع الخبر في حقل النوع المخصص.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload images (simulating with same service used for complaints)
      let uploadedImageUrls: string[] = images; // Assumes existing images are already URLs
      
      const localImages = images.filter(uri => !uri.startsWith('http'));
      if (localImages.length > 0) {
        const idPrefix = 'news_' + Date.now();
        const uploaded = await uploadComplaintImages(localImages, idPrefix);
        // merge existing urls with new uploaded ones
        uploadedImageUrls = [
          ...images.filter(uri => uri.startsWith('http')),
          ...uploaded
        ];
      }

      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        category,
        date: date.trim() || defaultDate,
        images: uploadedImageUrls,
      };
      
      if (category === 'أخرى' && customCategory.trim()) {
        payload.customCategory = customCategory.trim();
      }

      if (isEditing) {
        await updateNewsArticle(newsId, payload);
        Alert.alert('نجاح', 'تم تعديل الخبر بنجاح.', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
      } else {
        await addNewsArticle(payload);
        Alert.alert('نجاح', 'تمت إضافة الخبر بنجاح.', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('خطأ', 'تعذر حفظ الخبر، حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('تأكيد החذف', 'هل أنت متأكد أنك تريد حذف هذا الخبر نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteNewsArticle(newsId);
            navigation.goBack();
          } catch (e) {
            console.error(e);
            Alert.alert('خطأ', 'لم يتم الحذف.');
            setDeleting(false);
          }
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.card, SHADOWS.small]}>
          <Text style={styles.sectionTitle}>تصنيف الخبر</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {category === 'أخرى' && (
            <CustomInput
              label="اكتب نوع الخبر *"
              placeholder="مثال: إعلانات إدارية"
              value={customCategory}
              onChangeText={setCustomCategory}
              iconName="pricetag-outline"
            />
          )}
        </View>

        <View style={[styles.card, SHADOWS.small]}>
          <Text style={styles.sectionTitle}>تفاصيل الخبر</Text>
          
          <CustomInput
            label="تاريخ الخبر"
            placeholder="مثال: 01 أكتوبر 2026"
            value={date}
            onChangeText={setDate}
            iconName="calendar-outline"
          />

          <CustomInput
            label="عنوان الخبر *"
            placeholder="اكتب العنوان الرئيسي..."
            value={title}
            onChangeText={setTitle}
            iconName="text-outline"
          />

          <Text style={styles.inputLabel}>نص الخبر والتفاصيل *</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="اكتب التفاصيل الكاملة هنا..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={[styles.card, SHADOWS.small]}>
          <Text style={styles.sectionTitle}>الصور والمرفقات</Text>
          
          <View style={styles.imagesGrid}>
            <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
              <Text style={styles.addImageText}>إضافة صورة</Text>
            </TouchableOpacity>
            
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageThumbnailWrapper}>
                <Image source={{ uri }} style={styles.imageThumbnail} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => handleRemoveImage(idx)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          {isEditing && (
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={handleDelete}
              disabled={submitting || deleting}
            >
              {deleting ? <ActivityIndicator color="#FFF" /> : <Ionicons name="trash" size={24} color="#FFF" />}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.saveBtn, isEditing ? { flex: 1, marginRight: 12 } : { width: '100%' }]} 
            onPress={handleSave}
            disabled={submitting || deleting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>{isEditing ? 'حفظ التعديلات' : 'نشر الخبر'}</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 60 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'right', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8 },
  
  categoriesGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  categoryBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  categoryText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '700' },
  categoryTextActive: { color: '#FFF' },

  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8, marginTop: 12 },
  textAreaContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  textArea: { height: 160, fontSize: 14, color: COLORS.textPrimary },

  imagesGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  addImageBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryLight },
  addImageText: { fontSize: 12, color: COLORS.primary, marginTop: 8, fontWeight: '700' },
  imageThumbnailWrapper: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageThumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, padding: 2 },

  actionButtons: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 12 },
  saveBtn: { backgroundColor: COLORS.success, padding: 16, borderRadius: 12, alignItems: 'center', ...SHADOWS.medium },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  deleteBtn: { backgroundColor: COLORS.danger, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium }
});
